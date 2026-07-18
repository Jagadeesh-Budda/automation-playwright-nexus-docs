import { CoreRevisionAnalytics } from '../revisionEngine';

export function computeReadinessScore(base: CoreRevisionAnalytics, weights?: Partial<Record<string, number>>): number {
  // configurable weights with sensible defaults
  const w = {
    retentionRate: 0.25,
    avgReviewScore: 0.20,
    reviewStreak: 0.10,
    completionMomentum: 0.15, // derived from learningVelocity
    weakTopicsPenalty: 0.15,
    timeConsistency: 0.15,
    ...weights,
  } as Record<string, number>;

  const retention = (base.retentionRate ?? 100) / 100; // 0..1
  const avg = (base.avgReviewScore ?? 0) / 5; // assuming 1..5
  const streak = Math.min(base.reviewStreak ?? 0, 30) / 30;
  const velocity = (base.learningVelocity?.slice(-1)[0] ?? 0) / Math.max(1, Math.max(...(base.learningVelocity ?? [1])));
  const weakPenalty = Math.min((base.weakTopics?.length ?? 0) / 10, 1);
  const timeConsistency = 1 - weakPenalty; // placeholder

  const score =
    retention * w.retentionRate +
    avg * w.avgReviewScore +
    streak * w.reviewStreak +
    velocity * w.completionMomentum +
    (1 - weakPenalty) * w.weakTopicsPenalty +
    timeConsistency * w.timeConsistency;

  // normalize to 0-100
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}
