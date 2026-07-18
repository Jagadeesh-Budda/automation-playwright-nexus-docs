'use client';
import { useState, useRef, useCallback } from 'react';
import { useRevisionStore } from '../../store/useRevisionStore';
import type { UserNote } from '../../store/useRevisionStore';
import modulesData from '../../data/metadata.json';

interface Props {
  allNotes:       UserNote[];
  searchQuery:    string;
  onSearchChange: (q: string) => void;
  userId:         string;
}

function getLessonTitle(lessonId: string): string {
  const m = (modulesData as any[]).find((m: any) => m.id === lessonId);
  return m?.title ?? lessonId;
}

function exportAsMarkdown(note: UserNote) {
  const content = `# ${note.title}\n\n_Lesson: ${getLessonTitle(note.lessonId)}_\n_Updated: ${new Date(note.updatedAt).toLocaleDateString()}_\n\n---\n\n${note.content}`;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${note.title.replace(/\s+/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllAsMarkdown(notes: UserNote[]) {
  const content = notes.map(n =>
    `# ${n.title}\n\n_Lesson: ${getLessonTitle(n.lessonId)}_\n_Updated: ${new Date(n.updatedAt).toLocaleDateString()}_\n\n---\n\n${n.content}`
  ).join('\n\n---\n\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'all_revision_notes.md';
  a.click();
  URL.revokeObjectURL(url);
}

export default function NoteEditor({ allNotes, searchQuery, onSearchChange, userId }: Props) {
  const { createNote, updateNote, deleteNote } = useRevisionStore();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLessonId, setNewLessonId] = useState('');
  const [newContent, setNewContent] = useState('');
  const [preview, setPreview] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote = allNotes.find(n => n.id === selectedNoteId) ?? null;

  const handleSelectNote = (note: UserNote) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setPreview(false);
  };

  // Debounced auto-save
  const handleContentChange = useCallback((val: string) => {
    setEditContent(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (selectedNoteId) {
      saveTimer.current = setTimeout(() => {
        updateNote(selectedNoteId, editTitle, val);
      }, 1000);
    }
  }, [selectedNoteId, editTitle, updateNote]);

  const handleTitleChange = useCallback((val: string) => {
    setEditTitle(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (selectedNoteId) {
      saveTimer.current = setTimeout(() => {
        updateNote(selectedNoteId, val, editContent);
      }, 1000);
    }
  }, [selectedNoteId, editContent, updateNote]);

  const handleCreate = async () => {
    if (!newLessonId || !newTitle) return;
    const created = await createNote(newLessonId, newTitle, newContent, userId);
    if (created) {
      setShowCreate(false);
      setNewTitle(''); setNewLessonId(''); setNewContent('');
      handleSelectNote(created);
    }
  };

  const handleDelete = async (note: UserNote) => {
    if (!confirm(`Delete note "${note.title}"?`)) return;
    await deleteNote(note.id, note.lessonId);
    if (selectedNoteId === note.id) {
      setSelectedNoteId(null);
    }
  };

  // Simple markdown → HTML renderer (no external deps)
  function renderMarkdown(md: string): string {
    return md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  }

  const lessons = (modulesData as any[]).map((m: any) => ({ id: m.id, title: m.title }));

  return (
    <div className="note-editor-shell">
      {/* Sidebar */}
      <div className="note-sidebar">
        <div className="note-sidebar-header">
          <input
            id="note-search"
            className="revision-search"
            type="search"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
          <div className="note-sidebar-actions">
            <button
              id="create-note-btn"
              className="revision-btn revision-btn-primary"
              onClick={() => setShowCreate(true)}
            >
              + New Note
            </button>
            {allNotes.length > 0 && (
              <button
                id="export-all-notes-btn"
                className="revision-btn revision-btn-outline"
                onClick={() => exportAllAsMarkdown(allNotes)}
                title="Export all notes as Markdown"
              >
                ⬇ Export All
              </button>
            )}
          </div>
        </div>

        <div className="note-list">
          {allNotes.length === 0 ? (
            <div className="revision-empty">
              <span>📝</span>
              <p>No notes yet. Create your first note.</p>
            </div>
          ) : (
            allNotes.map(note => (
              <div
                key={note.id}
                id={`note-item-${note.id}`}
                className={`note-list-item ${selectedNoteId === note.id ? 'note-list-item--active' : ''}`}
                onClick={() => handleSelectNote(note)}
              >
                <div className="note-list-item-title">{note.title}</div>
                <div className="note-list-item-meta">
                  {getLessonTitle(note.lessonId)} · {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                <div className="note-list-item-preview">
                  {note.content.slice(0, 60)}{note.content.length > 60 ? '…' : ''}
                </div>
                <button
                  className="note-list-item-delete"
                  onClick={e => { e.stopPropagation(); handleDelete(note); }}
                  title="Delete note"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor / Create Panel */}
      <div className="note-main">
        {showCreate ? (
          <div className="note-create-panel">
            <h2 className="revision-section-title">New Note</h2>
            <select
              id="note-lesson-select"
              className="note-input note-lesson-select"
              value={newLessonId}
              onChange={e => setNewLessonId(e.target.value)}
            >
              <option value="">Select a lesson…</option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
            <input
              id="note-title-input"
              className="note-input"
              type="text"
              placeholder="Note title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <textarea
              id="note-content-input"
              className="note-textarea"
              placeholder="Write your note in Markdown…"
              rows={10}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
            />
            <div className="note-create-actions">
              <button
                id="note-save-btn"
                className="revision-btn revision-btn-primary"
                onClick={handleCreate}
                disabled={!newTitle || !newLessonId}
              >
                Save Note
              </button>
              <button
                className="revision-btn revision-btn-ghost"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedNote ? (
          <div className="note-edit-panel">
            <div className="note-edit-header">
              <input
                id="note-edit-title"
                className="note-title-input"
                value={editTitle}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Note title"
              />
              <div className="note-edit-header-actions">
                <button
                  className={`revision-btn ${preview ? 'revision-btn-primary' : 'revision-btn-outline'}`}
                  onClick={() => setPreview(v => !v)}
                >
                  {preview ? '✏️ Edit' : '👁 Preview'}
                </button>
                <button
                  id={`export-note-${selectedNote.id}`}
                  className="revision-btn revision-btn-outline"
                  onClick={() => exportAsMarkdown(selectedNote)}
                  title="Export as Markdown"
                >
                  ⬇ Export
                </button>
                <button
                  id={`delete-note-${selectedNote.id}`}
                  className="revision-btn revision-btn-ghost revision-btn-danger-ghost"
                  onClick={() => handleDelete(selectedNote)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>

            <div className="note-meta">
              📚 {getLessonTitle(selectedNote.lessonId)} · Auto-saves in 1s
            </div>

            {preview ? (
              <div
                className="note-preview"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }}
              />
            ) : (
              <textarea
                id="note-edit-content"
                className="note-textarea note-textarea--edit"
                value={editContent}
                onChange={e => handleContentChange(e.target.value)}
                placeholder="Write your note in Markdown…"
              />
            )}
          </div>
        ) : (
          <div className="note-empty-state">
            <span className="note-empty-icon">📝</span>
            <h2>Select a note to edit</h2>
            <p>Or create a new one to start capturing your insights.</p>
            <button
              className="revision-btn revision-btn-primary"
              onClick={() => setShowCreate(true)}
            >
              + New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
