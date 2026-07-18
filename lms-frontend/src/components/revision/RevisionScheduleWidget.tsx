'use client';
import type { DueItem } from '../../lib/revisionScheduler';
import { useRevisionStore } from '../../store/useRevisionStore';
import modulesData from '../../data/metadata.json';
import { useState } from 'react';

interface Props {
  dueItems:         DueItem[];
  versionFlagged:   string[];
  estimatedMinutes: number;
  userId:           string;
}

const CONFIDENCE_LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: 'Forgot',   color: '#ef4444', emoji: '😟' },
  2: { label: 'Hard',     color: '#f97316', emoji: '😕' },
  3: { label: 'Okay',     color: '#eab308', emoji: '😐' },
  4: { label: 'Good',     color: '#22c55e', emoji: '😊' },
  5: { label: 'Easy',     color: '#6366f1', emoji: '🤩' },
};

function getLessonMeta(lessonId: string) {
  return (modulesData as any[]).find((m: any) => m.id === lessonId) ?? null;
}

export default function RevisionScheduleWidget({ dueItems, versionFlagged, estimatedMinutes, userId }: Props) {
  const { recordReview } = useRevisionStore();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [recording, setRecording] = useState<Record<string, boolean>>({});

  const handleRecord = async (lessonId: string, confidence: number) => {
    setRecording(r => ({ ...r, [lessonId]: true }));
    await recordReview(
      lessonId,
      confidence as any,
      {
        confidence: confidence as any,
        currentVersion: (getLessonMeta(lessonId) as any)?.version ?? 1
      },
      userId,
    );
    setReviewing(null);
    setRecording(r => { const next = { ...r }; delete next[lessonId]; return next; });
  };

  if (dueItems.length === 0) {
    return (
      <div className="schedule-widget schedule-widget--empty">
        <span className="schedule-widget-check">✅</span>
        <h3>All caught up!</h3>
        <p>No reviews due today. Great consistency!</p>
      </div>
    );
  }

  return (
    <div className="schedule-widget">
      <div className="schedule-widget-header">
        <div>
          <h3 className="schedule-widget-title">📅 Due Today</h3>
          <p className="schedule-widget-meta">
            {dueItems.length} item{dueItems.length !== 1 ? 's' : ''} · ~{estimatedMinutes} min
          </p>
        </div>
      </div>

      <div className="schedule-widget-list">
        {dueItems.map(item => {
          const meta = getLessonMeta(item.lessonId);
          const isVersionFlagged = item.versionFlagged;

          return (
            <div
              key={item.lessonId}
              className={`schedule-item ${isVersionFlagged ? 'schedule-item--flagged' : ''}`}
            >
              <div className="schedule-item-info">
                <span className="schedule-item-icon">{isVersionFlagged ? '📝' : '🔁'}</span>
                <div>
                  <div className="schedule-item-title">{meta?.title ?? item.lessonId}</div>
                  <div className="schedule-item-sub">
                    {isVersionFlagged
                      ? `Updated (v${item.reviewedVersion} → v${item.currentVersion})`
                      : `Last score: ${item.lastScore}/5`
                    }
                  </div>
                </div>
              </div>

              <div className="schedule-item-actions">
                {reviewing === item.lessonId ? (
                  <div className="confidence-picker">
                    <span className="confidence-label">How well do you remember this?</span>
                    <div className="confidence-buttons">
                      {[1, 2, 3, 4, 5].map(c => {
                        const { label, color, emoji } = CONFIDENCE_LABELS[c];
                        return (
                          <button
                            key={c}
                            id={`confidence-${item.lessonId}-${c}`}
                            className="confidence-btn"
                            style={{ '--conf-color': color } as any}
                            onClick={() => handleRecord(item.lessonId, c)}
                            disabled={recording[item.lessonId]}
                            title={label}
                          >
                            {emoji} {label}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="revision-btn revision-btn-ghost"
                      onClick={() => setReviewing(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {meta && (
                      <a
                        href={`/courses/playwright/${meta.slug}`}
                        className="revision-btn revision-btn-outline"
                        id={`review-goto-${item.lessonId}`}
                      >
                        Review lesson →
                      </a>
                    )}
                    <button
                      id={`mark-reviewed-${item.lessonId}`}
                      className="revision-btn revision-btn-primary"
                      onClick={() => setReviewing(item.lessonId)}
                    >
                      Mark reviewed
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
