'use client';
import type { WeakTopic } from '../../lib/revisionEngine';
import modulesData from '../../data/metadata.json';

interface Props {
  topics: WeakTopic[];
}

function getSlug(lessonId: string): string | null {
  const m = (modulesData as any[]).find((m: any) => m.id === lessonId);
  return m?.slug ?? null;
}

const REASON_LABELS: Record<WeakTopic['reason'], string> = {
  'low-score':       'Low confidence score',
  'overdue':         'Overdue for review',
  'version-flagged': 'Lesson content updated',
  'repeated-fails':  'Repeated failures',
};

export default function WeakTopicsPanel({ topics }: Props) {
  if (topics.length === 0) return null;

  return (
    <div className="weak-topics-panel">
      <div className="weak-topics-header">
        <h3 className="weak-topics-title">⚠️ Weak Topics</h3>
        <span className="weak-topics-count">{topics.length} topic{topics.length !== 1 ? 's' : ''} need revision</span>
      </div>

      <p className="weak-topics-desc">
        These lessons have low confidence scores or repeated failures. Revising them now strengthens long-term retention.
      </p>

      <div className="weak-topics-list">
        {topics.map(topic => {
          const slug = getSlug(topic.lessonId);
          return (
            <div key={topic.lessonId} className="weak-topic-item">
              <div className="weak-topic-info">
                <span className="weak-topic-icon">
                  {topic.avgScore < 2 ? '🔴' : topic.avgScore < 3 ? '🟡' : '🟠'}
                </span>
                <div>
                  <div className="weak-topic-name">{topic.lessonTitle}</div>
                  <div className="weak-topic-reason">{REASON_LABELS[topic.reason]}</div>
                </div>
              </div>
              <div className="weak-topic-actions">
                <span className="weak-topic-score">{topic.avgScore.toFixed(1)}/5</span>
                {slug && (
                  <a
                    id={`revise-weak-${topic.lessonId}`}
                    href={`/courses/playwright/${slug}`}
                    className="revision-btn revision-btn-primary revision-btn--sm"
                  >
                    Revise →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
