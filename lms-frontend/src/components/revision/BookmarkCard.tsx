'use client';
import { useState } from 'react';
import { useRevisionStore } from '../../store/useRevisionStore';
import { useMasteryStore } from '../../store/useMasteryStore';
import modulesData from '../../data/metadata.json';

interface Props {
  lessonId: string;
  pinned:   boolean;
  userId:   string;
}

function getLessonMeta(lessonId: string) {
  return (modulesData as any[]).find((m: any) => m.id === lessonId) ?? null;
}

export default function BookmarkCard({ lessonId, pinned, userId }: Props) {
  const { userProgress: masteryProgress } = useMasteryStore();

  const meta = getLessonMeta(lessonId);
  const [swiped, setSwiped] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Completion from mastery store
  const score = masteryProgress?.[lessonId];
  const completed = score !== undefined && score >= 80;
  const completionPct = score !== undefined ? Math.min(100, score) : 0;

  const handleRemove = () => useRevisionStore.getState().toggleBookmark(lessonId, userId);
  const handlePin   = () => useRevisionStore.getState().togglePin(lessonId, userId);

  // Swipe-to-remove on mobile
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (delta > 80) setSwiped(true);
    setTouchStartX(null);
  };

  if (swiped) {
    return (
      <div className="bookmark-card bookmark-card--swipe-confirm">
        <p>Remove bookmark?</p>
        <div className="bookmark-card-swipe-actions">
          <button
            id={`bookmark-remove-confirm-${lessonId}`}
            className="revision-btn revision-btn-danger"
            onClick={handleRemove}
          >
            Remove
          </button>
          <button
            className="revision-btn revision-btn-ghost"
            onClick={() => setSwiped(false)}
          >
            Keep
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bookmark-card ${pinned ? 'bookmark-card--pinned' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bookmark-card-body">
        <div className="bookmark-card-meta">
          {pinned && <span className="bookmark-pin-icon">📌</span>}
          <span className="bookmark-card-module">{meta?.stage ?? 'Lesson'}</span>
        </div>
        <h3 className="bookmark-card-title">
          {meta?.title ?? lessonId}
        </h3>

        {/* Completion bar */}
        <div className="bookmark-completion-bar" title={`${completionPct}% score`}>
          <div
            className={`bookmark-completion-fill ${completed ? 'bookmark-completion-fill--done' : ''}`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="bookmark-completion-label">
          {completed ? '✅ Completed' : completionPct > 0 ? `${completionPct}% scored` : 'Not started'}
        </span>
      </div>

      <div className="bookmark-card-actions">
        {meta && (
          <a
            id={`bookmark-goto-${lessonId}`}
            href={`/courses/playwright/${meta.slug}`}
            className="revision-btn revision-btn-primary"
          >
            Go to lesson →
          </a>
        )}
        <button
          id={`bookmark-pin-${lessonId}`}
          className={`revision-btn ${pinned ? 'revision-btn-ghost' : 'revision-btn-outline'}`}
          onClick={handlePin}
          title={pinned ? 'Unpin' : 'Pin to top'}
        >
          {pinned ? 'Unpin' : '📌 Pin'}
        </button>
        <button
          id={`bookmark-remove-${lessonId}`}
          className="revision-btn revision-btn-ghost revision-btn-danger-ghost"
          onClick={handleRemove}
          title="Remove bookmark"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
