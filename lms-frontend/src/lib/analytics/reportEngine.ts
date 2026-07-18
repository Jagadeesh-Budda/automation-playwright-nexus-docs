import { CoreRevisionAnalytics } from '../revisionEngine';

export function compileWeeklyReport(userId: string, base: CoreRevisionAnalytics, timeSpent: any) {
  // Minimal implementation: pick top improvement and weak topics
  const biggestImprovement = base.weakTopics?.length ? base.weakTopics[0] : null;

  return {
    achievements: [],
    biggestImprovement,
    needsAttention: base.weakTopics?.slice(0, 5) ?? [],
    nextWeekGoal: 'Review top weak topics',
    recommendedRevision: base.weakTopics?.slice(0, 3).map(w => w.lessonId) ?? [],
    estimatedFinishDate: null,
    consistency: base.reviewStreak ?? 0,
    timeDistribution: timeSpent?.daily ?? {},
  };
}
