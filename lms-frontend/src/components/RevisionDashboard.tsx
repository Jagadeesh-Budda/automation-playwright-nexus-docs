'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRevisionStore } from '../store/useRevisionStore';
import type { UserNote } from '../store/useRevisionStore';
import { useMasteryStore } from '../store/useMasteryStore';
import type { DueItem } from '../lib/revisionScheduler';
import BookmarkCard from './revision/BookmarkCard';
import NoteEditor from './revision/NoteEditor';
import RevisionScheduleWidget from './revision/RevisionScheduleWidget';
import RevisionHeatmap from './revision/RevisionHeatmap';
import RevisionAnalytics from './revision/RevisionAnalytics';
import WeakTopicsPanel from './revision/WeakTopicsPanel';
import modulesData from '../data/metadata.json';

type Tab = 'today' | 'bookmarks' | 'notes' | 'analytics' | 'calendar';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '📌' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'calendar', label: 'Calendar', icon: '📆' },
];

function getLessonMeta(lessonId: string) {
  return (modulesData as any[]).find((m: any) => m.id === lessonId) ?? null;
}

export default function RevisionDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [noteSearch, setNoteSearch] = useState('');
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);

  const { userId, userName } = useMasteryStore();
  const {
    bookmarks, pinnedLessons, notes, dueItems, versionFlaggedLessons,
    analytics, analyticsLoading, revisionStreak, estimatedTimeToday,
    init, fetchDueItems, fetchAnalytics, initialized,
  } = useRevisionStore();

  useEffect(() => {
    if (!initialized && userId) {
      init(userId);
    }
  }, [userId, initialized, init]);

  useEffect(() => {
    if (initialized && userId) {
      const currentVersions: Record<string, number> = {};
      (modulesData as any[]).forEach((m: any) => { currentVersions[m.id] = m.version ?? 1; });
      fetchDueItems(userId, currentVersions);
      fetchAnalytics(userId);
    }
  }, [initialized, userId, fetchDueItems, fetchAnalytics]);

  // Filter bookmarks by search
  const filteredBookmarks = bookmarks.filter((id: string) => {
    const meta = getLessonMeta(id);
    return !bookmarkSearch || (meta?.title ?? id).toLowerCase().includes(bookmarkSearch.toLowerCase());
  });

  // Flatten and filter notes
  const allNotes = (Object.values(notes).flat() as UserNote[]).filter((n: UserNote) =>
    !noteSearch || n.title.toLowerCase().includes(noteSearch.toLowerCase()) || n.content.toLowerCase().includes(noteSearch.toLowerCase())
  );

  return (
    <div className="revision-dashboard">
      {/* Header */}
      <div className="revision-header">
        <div className="revision-header-left">
          <h1 className="revision-title">
            <span className="revision-title-icon">🧠</span>
            Revision Center
          </h1>
          <p className="revision-subtitle">Your personal learning memory system</p>
        </div>
        <div className="revision-header-stats">
          {revisionStreak > 0 && (
            <div className="revision-streak-badge">
              🔥 {revisionStreak} day streak
            </div>
          )}
          {dueItems.length > 0 && (
            <div className="revision-due-badge">
              {dueItems.length} due today
            </div>
          )}
          <button
            id="quick-note-btn"
            className="revision-quick-note-btn"
            onClick={() => setShowQuickNote(v => !v)}
            title="Quick note"
          >
            ✏️ Quick Note
          </button>
        </div>
      </div>

      {/* Quick Note Panel */}
      {showQuickNote && (
        <div className="revision-quick-note-panel">
          <textarea
            className="revision-quick-note-input"
            placeholder="Jot down a quick thought..."
            value={quickNote}
            onChange={e => setQuickNote(e.target.value)}
            rows={3}
          />
          <div className="revision-quick-note-actions">
            <button
              className="revision-btn revision-btn-primary"
              onClick={() => { setQuickNote(''); setShowQuickNote(false); }}
            >
              Save
            </button>
            <button
              className="revision-btn revision-btn-ghost"
              onClick={() => setShowQuickNote(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="revision-tabs" role="tablist" aria-label="Revision Center sections">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`revision-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`revision-tab ${activeTab === tab.id ? 'revision-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="revision-tab-icon">{tab.icon}</span>
            <span className="revision-tab-label">{tab.label}</span>
            {tab.id === 'today' && dueItems.length > 0 && (
              <span className="revision-tab-badge">{dueItems.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="revision-content" role="tabpanel">

        {/* TODAY TAB */}
        {activeTab === 'today' && (
          <div className="revision-today">
            <div className="revision-today-grid">
              {/* Due reviews widget */}
              <RevisionScheduleWidget
                dueItems={dueItems}
                versionFlagged={versionFlaggedLessons}
                estimatedMinutes={estimatedTimeToday}
                userId={userId}
              />

              {/* Stats row */}
              <div className="revision-stats-row">
                <div className="revision-stat-card">
                  <span className="revision-stat-number">{dueItems.length}</span>
                  <span className="revision-stat-label">Due Today</span>
                </div>
                <div className="revision-stat-card">
                  <span className="revision-stat-number">{bookmarks.length}</span>
                  <span className="revision-stat-label">Bookmarks</span>
                </div>
                <div className="revision-stat-card">
                  <span className="revision-stat-number">{Object.values(notes).flat().length}</span>
                  <span className="revision-stat-label">Notes</span>
                </div>
                <div className="revision-stat-card">
                  <span className="revision-stat-number">{estimatedTimeToday}m</span>
                  <span className="revision-stat-label">Est. Time</span>
                </div>
              </div>

              {/* Weak topics */}
              {analytics && analytics.weakTopics.length > 0 && (
                <WeakTopicsPanel topics={analytics.weakTopics} />
              )}

              {/* Version-flagged lessons */}
              {versionFlaggedLessons.length > 0 && (
                <div className="revision-version-alert">
                  <span className="revision-version-alert-icon">📝</span>
                  <div>
                    <strong>Lessons updated since your last review</strong>
                    <p>{versionFlaggedLessons.length} lesson(s) have new content. Click to re-review.</p>
                    <div className="revision-version-lessons">
                      {versionFlaggedLessons.map((lid: string) => {
                        const meta = getLessonMeta(lid);
                        return meta ? (
                          <a key={lid} href={`/courses/playwright/${meta.slug}`} className="revision-version-lesson-link">
                            {meta.title}
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Retention */}
              {analytics && (
                <div className="revision-retention-card">
                  <div className="revision-retention-label">Retention Rate</div>
                  <div className="revision-retention-bar">
                    <div
                      className="revision-retention-fill"
                      style={{ width: `${analytics.retentionRate}%` }}
                    />
                  </div>
                  <div className="revision-retention-pct">{analytics.retentionRate}%</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <div className="revision-bookmarks">
            <div className="revision-search-row">
              <input
                id="bookmark-search"
                className="revision-search"
                type="search"
                placeholder="Search bookmarks..."
                value={bookmarkSearch}
                onChange={e => setBookmarkSearch(e.target.value)}
              />
              <span className="revision-count">{filteredBookmarks.length} lessons</span>
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="revision-empty">
                <span>📌</span>
                <p>No bookmarks yet. Bookmark lessons while studying to see them here.</p>
              </div>
            ) : (
              <div className="revision-bookmark-grid">
                {/* Pinned first */}
                {filteredBookmarks.filter((id: string) => pinnedLessons.includes(id)).length > 0 && (
                  <div className="revision-bookmark-section">
                    <h3 className="revision-section-title">📌 Pinned</h3>
                    {filteredBookmarks
                      .filter((id: string) => pinnedLessons.includes(id))
                      .map((id: string) => (
                        <BookmarkCard key={id} lessonId={id} pinned userId={userId} />
                      ))}
                  </div>
                )}
                <div className="revision-bookmark-section">
                  {filteredBookmarks.filter((id: string) => !pinnedLessons.includes(id)).length > 0 && (
                    <h3 className="revision-section-title">Bookmarked</h3>
                  )}
                  {filteredBookmarks
                    .filter((id: string) => !pinnedLessons.includes(id))
                    .map((id: string) => (
                      <BookmarkCard key={id} lessonId={id} pinned={false} userId={userId} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <NoteEditor
            allNotes={allNotes}
            searchQuery={noteSearch}
            onSearchChange={setNoteSearch}
            userId={userId}
          />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          analyticsLoading
            ? <div className="revision-loading">Loading analytics…</div>
            : analytics
              ? <RevisionAnalytics data={analytics} />
              : <div className="revision-empty"><p>No review data yet. Complete your first review to see analytics.</p></div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="revision-calendar-view">
            <h2 className="revision-section-title">📅 Review Calendar</h2>
            <p className="revision-subtitle-sm">Your review activity over the past year</p>
            {analytics
              ? <RevisionHeatmap heatmap={analytics.heatmap} />
              : <div className="revision-empty"><p>No review history yet.</p></div>
            }

            {/* Upcoming schedule */}
            {dueItems.length > 0 && (
              <div className="revision-upcoming">
                <h3 className="revision-section-title">Upcoming Reviews</h3>
                {dueItems.slice(0, 10).map((item: DueItem) => {
                  const meta = getLessonMeta(item.lessonId);
                  return (
                    <div key={item.lessonId} className="revision-upcoming-item">
                      <span className="revision-upcoming-emoji">
                        {item.versionFlagged ? '📝' : '🔁'}
                      </span>
                      <div className="revision-upcoming-info">
                        <span className="revision-upcoming-title">{meta?.title ?? item.lessonId}</span>
                        <span className="revision-upcoming-date">
                          {item.versionFlagged
                            ? 'Updated — re-review recommended'
                            : `Due: ${item.nextReview.toLocaleDateString()}`
                          }
                        </span>
                      </div>
                      {meta && (
                        <a
                          href={`/courses/playwright/${meta.slug}`}
                          className="revision-upcoming-link"
                        >
                          Go →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
