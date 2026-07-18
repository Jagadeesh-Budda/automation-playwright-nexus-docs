/**
 * useRevisionStore.ts — Revision Center State
 *
 * Completely decoupled from useMasteryStore.
 * No imports from useMasteryStore — these are independent systems.
 *
 * Optimistic update pattern: all mutations update local state first,
 * sync to backend async, and roll back on error.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DueItem, computeNextSchedule, getDueItems, getEstimatedRevisionTime } from '../lib/revisionScheduler';
import type { Confidence, ReviewInput, ScheduleRecord } from '../lib/revisionScheduler';
import type { RevisionAnalytics } from '../lib/revisionEngine';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface UserNote {
  id:        string;
  userId:    string;
  lessonId:  string;
  title:     string;
  content:   string;
  tags:      string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserHighlight {
  id:              string;
  userId:          string;
  lessonId:        string;
  paragraphId:     string;
  anchorText:      string;
  focusText:       string;
  occurrenceIndex: number;
  color:           string;
  createdAt:       string;
}

export interface RevisionQueueItem {
  op:        'bookmark-toggle' | 'note-create' | 'note-update' | 'note-delete' | 'highlight-add' | 'highlight-remove' | 'pin-toggle' | 'tag-update';
  payload:   unknown;
  timestamp: string;
  retries:   number;
}

// ─── State Interface ────────────────────────────────────────────────────────────
interface RevisionState {
  // Core revision data — plain arrays/objects for clean Zustand persistence
  bookmarks:             string[];           // lessonIds
  pinnedLessons:         string[];           // lessonIds
  notes:                 Record<string, UserNote[]>; // lessonId → notes[]
  highlights:            UserHighlight[];
  tags:                  Record<string, string[]>;   // lessonId → tags[]

  // Scheduler state
  dueItems:              DueItem[];
  versionFlaggedLessons: string[];
  scheduleRecords:       ScheduleRecord[];
  revisionStreak:        number;
  estimatedTimeToday:    number;             // minutes

  // Analytics (fetched from API, cached here)
  analytics:             RevisionAnalytics | null;
  analyticsLoading:      boolean;

  // UI state
  loading:               boolean;
  error:                 string | null;
  initialized:           boolean;

  // Offline queue for optimistic updates
  revisionQueue:         RevisionQueueItem[];

  // ─── Actions ────────────────────────────────────────────────────────────────

  // Init
  init: (userId: string) => Promise<void>;

  // Bookmarks
  toggleBookmark:  (lessonId: string, userId: string) => Promise<void>;
  togglePin:       (lessonId: string, userId: string) => Promise<void>;

  // Notes — multiple per lesson
  createNote:      (lessonId: string, title: string, content: string, userId: string) => Promise<UserNote | null>;
  updateNote:      (noteId: string, title: string, content: string) => Promise<void>;
  deleteNote:      (noteId: string, lessonId: string) => Promise<void>;

  // Highlights
  addHighlight:    (h: Omit<UserHighlight, 'id' | 'createdAt'>, userId: string) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;

  // Tags
  addTag:          (lessonId: string, tag: string) => void;
  removeTag:       (lessonId: string, tag: string) => void;

  // Scheduler
  fetchDueItems:   (userId: string, currentVersions: Record<string, number>) => Promise<void>;
  recordReview:    (lessonId: string, confidence: Confidence, input: Omit<ReviewInput, 'lessonId'>, userId: string) => Promise<void>;

  // Analytics
  fetchAnalytics:  (userId: string) => Promise<void>;

  // Offline queue
  flushQueue:      (userId: string) => Promise<void>;
  enqueue:         (item: Omit<RevisionQueueItem, 'retries'>) => void;
}

// ─── API Helpers ───────────────────────────────────────────────────────────────
async function apiFetch(url: string, options: RequestInit = {}) {
  const userId = typeof window !== 'undefined'
    ? localStorage.getItem('asa_user_id') ?? 'student_1'
    : 'student_1';

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${url} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useRevisionStore = create<RevisionState>()(
  persist(
    (set, get) => ({
      bookmarks:             [],
      pinnedLessons:         [],
      notes:                 {},
      highlights:            [],
      tags:                  {},
      dueItems:              [],
      versionFlaggedLessons: [],
      scheduleRecords:       [],
      revisionStreak:        0,
      estimatedTimeToday:    0,
      analytics:             null,
      analyticsLoading:      false,
      loading:               false,
      error:                 null,
      initialized:           false,
      revisionQueue:         [],

      // ── Init ──────────────────────────────────────────────────────────────
      init: async (userId) => {
        if (get().initialized) return;
        set({ loading: true, error: null });
        try {
          const [bmRes, notesRes, hlRes] = await Promise.all([
            apiFetch('/api/revision/bookmarks'),
            apiFetch('/api/revision/notes'),
            apiFetch('/api/revision/highlights'),
          ]);

          const bookmarks: string[] = (bmRes.bookmarks ?? []).map((b: any) => b.lessonId);
          const pinnedLessons: string[] = (bmRes.bookmarks ?? [])
            .filter((b: any) => b.pinned)
            .map((b: any) => b.lessonId);

          const notes: Record<string, UserNote[]> = {};
          for (const note of (notesRes.notes ?? []) as UserNote[]) {
            if (!notes[note.lessonId]) notes[note.lessonId] = [];
            notes[note.lessonId].push(note);
          }

          set({
            bookmarks,
            pinnedLessons,
            notes,
            highlights: hlRes.highlights ?? [],
            initialized: true,
            loading: false,
          });
        } catch (e: any) {
          set({ error: e.message, loading: false });
        }
      },

      // ── Bookmarks ─────────────────────────────────────────────────────────
      toggleBookmark: async (lessonId, userId) => {
        const prev = get().bookmarks;
        const isBookmarked = prev.includes(lessonId);

        // Optimistic update
        set({ bookmarks: isBookmarked ? prev.filter(id => id !== lessonId) : [...prev, lessonId] });

        try {
          if (isBookmarked) {
            await apiFetch(`/api/revision/bookmarks/${encodeURIComponent(lessonId)}`, { method: 'DELETE' });
          } else {
            await apiFetch('/api/revision/bookmarks', { method: 'POST', body: JSON.stringify({ lessonId }) });
          }
        } catch {
          // Rollback
          set({ bookmarks: prev });
          get().enqueue({ op: 'bookmark-toggle', payload: { lessonId, action: isBookmarked ? 'remove' : 'add' }, timestamp: new Date().toISOString() });
        }
      },

      togglePin: async (lessonId, userId) => {
        const prev = get().pinnedLessons;
        const isPinned = prev.includes(lessonId);
        set({ pinnedLessons: isPinned ? prev.filter(id => id !== lessonId) : [...prev, lessonId] });

        try {
          await apiFetch(`/api/revision/bookmarks/${encodeURIComponent(lessonId)}`, {
            method: 'PATCH',
            body: JSON.stringify({ pinned: !isPinned }),
          });
        } catch {
          set({ pinnedLessons: prev });
          get().enqueue({ op: 'pin-toggle', payload: { lessonId, pinned: !isPinned }, timestamp: new Date().toISOString() });
        }
      },

      // ── Notes ─────────────────────────────────────────────────────────────
      createNote: async (lessonId, title, content, userId) => {
        const tempId = `temp_${Date.now()}`;
        const tempNote: UserNote = {
          id: tempId, userId, lessonId, title, content, tags: [],
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };

        // Optimistic add
        const prevNotes = get().notes;
        set({ notes: { ...prevNotes, [lessonId]: [...(prevNotes[lessonId] ?? []), tempNote] } });

        try {
          const res = await apiFetch('/api/revision/notes', {
            method: 'POST',
            body: JSON.stringify({ lessonId, title, content }),
          });
          const saved: UserNote = res.note;
          // Replace temp with real
          set(state => ({
            notes: {
              ...state.notes,
              [lessonId]: state.notes[lessonId].map(n => n.id === tempId ? saved : n),
            },
          }));
          return saved;
        } catch {
          // Rollback
          set({ notes: prevNotes });
          get().enqueue({ op: 'note-create', payload: { lessonId, title, content }, timestamp: new Date().toISOString() });
          return null;
        }
      },

      updateNote: async (noteId, title, content) => {
        const prevNotes = get().notes;
        // Optimistic update across all lesson buckets
        const updated: Record<string, UserNote[]> = {};
        for (const [lid, arr] of Object.entries(prevNotes)) {
          updated[lid] = arr.map(n =>
            n.id === noteId ? { ...n, title, content, updatedAt: new Date().toISOString() } : n
          );
        }
        set({ notes: updated });

        try {
          await apiFetch(`/api/revision/notes/${noteId}`, {
            method: 'PATCH',
            body: JSON.stringify({ title, content }),
          });
        } catch {
          set({ notes: prevNotes });
          get().enqueue({ op: 'note-update', payload: { noteId, title, content }, timestamp: new Date().toISOString() });
        }
      },

      deleteNote: async (noteId, lessonId) => {
        const prevNotes = get().notes;
        set({
          notes: {
            ...prevNotes,
            [lessonId]: (prevNotes[lessonId] ?? []).filter(n => n.id !== noteId),
          },
        });

        try {
          await apiFetch(`/api/revision/notes/${noteId}`, { method: 'DELETE' });
        } catch {
          set({ notes: prevNotes });
          get().enqueue({ op: 'note-delete', payload: { noteId, lessonId }, timestamp: new Date().toISOString() });
        }
      },

      // ── Highlights ────────────────────────────────────────────────────────
      addHighlight: async (h, userId) => {
        const tempId = `temp_${Date.now()}`;
        const tempHL: UserHighlight = { ...h, id: tempId, createdAt: new Date().toISOString() };
        const prev = get().highlights;
        set({ highlights: [...prev, tempHL] });

        try {
          const res = await apiFetch('/api/revision/highlights', {
            method: 'POST',
            body: JSON.stringify(h),
          });
          const saved: UserHighlight = res.highlight;
          set(state => ({
            highlights: state.highlights.map(hl => hl.id === tempId ? saved : hl),
          }));
        } catch {
          set({ highlights: prev });
          get().enqueue({ op: 'highlight-add', payload: h, timestamp: new Date().toISOString() });
        }
      },

      removeHighlight: async (id) => {
        const prev = get().highlights;
        set({ highlights: prev.filter(h => h.id !== id) });

        try {
          await apiFetch(`/api/revision/highlights/${id}`, { method: 'DELETE' });
        } catch {
          set({ highlights: prev });
          get().enqueue({ op: 'highlight-remove', payload: { id }, timestamp: new Date().toISOString() });
        }
      },

      // ── Tags ──────────────────────────────────────────────────────────────
      addTag: (lessonId, tag) => {
        const prev = get().tags[lessonId] ?? [];
        if (prev.includes(tag)) return;
        set({ tags: { ...get().tags, [lessonId]: [...prev, tag] } });
      },

      removeTag: (lessonId, tag) => {
        set({ tags: { ...get().tags, [lessonId]: (get().tags[lessonId] ?? []).filter(t => t !== tag) } });
      },

      // ── Scheduler ─────────────────────────────────────────────────────────
      fetchDueItems: async (userId, currentVersions) => {
        try {
          const res = await apiFetch('/api/revision/schedule');
          const records: ScheduleRecord[] = (res.records ?? []).map((r: any) => ({
            ...r,
            nextReview: new Date(r.nextReview),
          }));

          const due = getDueItems(records, currentVersions);
          const flagged = due.filter(d => d.versionFlagged).map(d => d.lessonId);
          const estimated = getEstimatedRevisionTime(records, currentVersions);

          set({
            scheduleRecords:       records,
            dueItems:              due,
            versionFlaggedLessons: flagged,
            estimatedTimeToday:    estimated,
          });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      recordReview: async (lessonId, confidence, input, userId) => {
        const prevRecords = get().scheduleRecords;
        const existing = prevRecords.find(r => r.lessonId === lessonId);
        const current: Pick<ScheduleRecord, 'interval' | 'repetitions' | 'easeFactor'> = existing ?? {
          interval: 1, repetitions: 0, easeFactor: 2.5,
        };

        const next = computeNextSchedule(current, { ...input, lessonId, confidence });

        // Optimistic update on schedule records
        const updated = existing
          ? prevRecords.map(r => r.lessonId === lessonId ? { ...r, ...next } : r)
          : [...prevRecords, { userId, lessonId, ...current, ...next, lessonVersion: input.currentVersion, createdAt: new Date() } as ScheduleRecord];
        set({ scheduleRecords: updated });

        try {
          await apiFetch('/api/revision/schedule/review', {
            method: 'POST',
            body: JSON.stringify({ ...input, lessonId, confidence }),
          });
          // Refresh due items after recording
          const currentVersions: Record<string, number> = {};
          updated.forEach(r => { currentVersions[r.lessonId] = r.lessonVersion; });
          const due = getDueItems(updated, currentVersions);
          set({ dueItems: due, versionFlaggedLessons: due.filter(d => d.versionFlagged).map(d => d.lessonId) });
        } catch {
          set({ scheduleRecords: prevRecords });
        }
      },

      // ── Analytics ─────────────────────────────────────────────────────────
      fetchAnalytics: async (userId) => {
        set({ analyticsLoading: true });
        try {
          const res = await apiFetch('/api/revision/analytics');
          set({ analytics: res.analytics, revisionStreak: res.analytics?.reviewStreak ?? 0, analyticsLoading: false });
        } catch (e: any) {
          set({ analyticsLoading: false, error: e.message });
        }
      },

      // ── Offline Queue ─────────────────────────────────────────────────────
      enqueue: (item) => {
        set(state => ({ revisionQueue: [...state.revisionQueue, { ...item, retries: 0 }] }));
      },

      flushQueue: async (userId) => {
        const queue = get().revisionQueue;
        if (queue.length === 0) return;

        const remaining: RevisionQueueItem[] = [];
        for (const item of queue) {
          try {
            // Re-dispatch based on op type — simplified retry
            if (item.op === 'bookmark-toggle') {
              const { lessonId, action } = item.payload as any;
              if (action === 'add') {
                await apiFetch('/api/revision/bookmarks', { method: 'POST', body: JSON.stringify({ lessonId }) });
              } else {
                await apiFetch(`/api/revision/bookmarks/${encodeURIComponent(lessonId)}`, { method: 'DELETE' });
              }
            } else if (item.op === 'note-create') {
              const { lessonId, title, content } = item.payload as any;
              await apiFetch('/api/revision/notes', { method: 'POST', body: JSON.stringify({ lessonId, title, content }) });
            } else if (item.op === 'note-update') {
              const { noteId, title, content } = item.payload as any;
              await apiFetch(`/api/revision/notes/${noteId}`, { method: 'PATCH', body: JSON.stringify({ title, content }) });
            } else if (item.op === 'note-delete') {
              const { noteId } = item.payload as any;
              await apiFetch(`/api/revision/notes/${noteId}`, { method: 'DELETE' });
            } else if (item.op === 'highlight-add') {
              await apiFetch('/api/revision/highlights', { method: 'POST', body: JSON.stringify(item.payload) });
            } else if (item.op === 'highlight-remove') {
              const { id } = item.payload as any;
              await apiFetch(`/api/revision/highlights/${id}`, { method: 'DELETE' });
            }
          } catch {
            if (item.retries < 3) {
              remaining.push({ ...item, retries: item.retries + 1 });
            }
            // silently drop after 3 retries
          }
        }
        set({ revisionQueue: remaining });
      },
    }),
    {
      name: 'asa_revision_store',
      storage: createJSONStorage(() => localStorage),
      // Only persist lightweight fields — bulk data is always re-fetched from API
      partialize: (state) => ({
        bookmarks:      state.bookmarks,
        pinnedLessons:  state.pinnedLessons,
        tags:           state.tags,
        revisionStreak: state.revisionStreak,
        revisionQueue:  state.revisionQueue,
      }),
    }
  )
);
