/**
 * revisionEngine.ts — Revision Analytics & Weak-Topic Detection
 *
 * All computations run client-side over data fetched from the API.
 * Keeps analytics completely decoupled from mastery/XP systems.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface ReviewHistoryItem {
  lessonId:  string;
  reviewedAt: Date;
  score:     number; // 1–5 confidence
}

export interface WeakTopic {
  lessonId:   string;
  lessonTitle: string;
  avgScore:   number;
  reviewCount: number;
  reason:     'low-score' | 'overdue' | 'version-flagged' | 'repeated-fails';
}

export interface HeatmapDay {
  date:     string; // YYYY-MM-DD
  sessions: number;
}

export interface TimeSpentData {
  daily: Record<string, number>;
  weekly: number[];
}

export interface CompletionTrends {
  modules: Record<string, { score: number; attempts: number }>;
}

export interface WeeklyReport {
  achievements: string[];
  biggestImprovement: WeakTopic | null;
  needsAttention: WeakTopic[];
  nextWeekGoal: string;
  recommendedRevision: string[];
  estimatedFinishDate: string | null;
  consistency: number;
  timeDistribution: Record<string, number>;
}

export interface InstructorAggregates {
  hardestLessons: Array<{ lessonId: string; score: number; failRate: number }>;
  avgCompletion: Record<string, number>;
  dropOffLocations: Array<{ lessonId: string; dropOffRate: number }>;
  avgQuizScores: Record<string, number>;
  avgStudyTime: Record<string, number>;
}

export interface CoreRevisionAnalytics {
  retentionRate:      number;   // %  — due items reviewed on time
  forgottenLessons:   string[]; // lessonIds overdue by > 7 days
  weakTopics:         WeakTopic[];
  avgReviewScore:     number;   // mean confidence over last 30 days
  learningVelocity:   number[]; // reviews per week, last 8 weeks [oldest…newest]
  reviewHistory:      ReviewHistoryItem[];
  heatmap:            HeatmapDay[];
  totalReviews:       number;
  reviewStreak:       number;   // consecutive days with at least 1 review
  estimatedTime:      number;   // minutes needed today
}

export interface RevisionAnalytics extends CoreRevisionAnalytics {
  timeSpent:          TimeSpentData;
  readinessScore:     number;
  completionTrends:   CompletionTrends;
  weeklyReport:       WeeklyReport;
  instructor:         InstructorAggregates;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

// ─── Core Engine ───────────────────────────────────────────────────────────────
export class RevisionEngine {

  /**
   * Retention rate: % of due items reviewed on-time (within 24h of due date).
   */
  static getRetentionRate(
    history: ReviewHistoryItem[],
    scheduleMap: Record<string, Date>, // lessonId → nextReview (before the review happened)
  ): number {
    if (history.length === 0) return 100;

    let onTime = 0;
    for (const review of history) {
      const due = scheduleMap[review.lessonId];
      if (!due) continue;
      const late = daysBetween(due, review.reviewedAt);
      if (late <= 1) onTime++;
    }
    return Math.round((onTime / history.length) * 100);
  }

  /**
   * Forgotten lessons: overdue by more than 7 days and never reviewed, or score was 1.
   */
  static getForgottenLessons(
    scheduleRecords: Array<{ lessonId: string; nextReview: Date; lastScore: number }>,
  ): string[] {
    const now = new Date();
    return scheduleRecords
      .filter(r => {
        const overdue = daysBetween(r.nextReview, now);
        return overdue > 7 || r.lastScore === 1;
      })
      .map(r => r.lessonId);
  }

  /**
   * Weak topics: lessons with avgScore < 3 or high repeat-failure rate.
   */
  static getWeakTopics(
    history: ReviewHistoryItem[],
    lessonTitles: Record<string, string>,
  ): WeakTopic[] {
    const scoreMap: Record<string, number[]> = {};

    for (const item of history) {
      if (!scoreMap[item.lessonId]) scoreMap[item.lessonId] = [];
      scoreMap[item.lessonId].push(item.score);
    }

    const weak: WeakTopic[] = [];
    for (const [lessonId, scores] of Object.entries(scoreMap)) {
      const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
      const failCount = scores.filter(s => s <= 2).length;

      if (avg < 3 || failCount >= 2) {
        const reason: WeakTopic['reason'] =
          failCount >= 3 ? 'repeated-fails' : avg < 2 ? 'low-score' : 'low-score';
        weak.push({
          lessonId,
          lessonTitle: lessonTitles[lessonId] ?? lessonId,
          avgScore:    Math.round(avg * 10) / 10,
          reviewCount: scores.length,
          reason,
        });
      }
    }

    return weak.sort((a, b) => a.avgScore - b.avgScore);
  }

  /**
   * Average review score over the last N days.
   */
  static getAvgReviewScore(history: ReviewHistoryItem[], days = 30): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = history.filter(r => r.reviewedAt >= cutoff);
    if (recent.length === 0) return 0;
    return Math.round((recent.reduce((s, r) => s + r.score, 0) / recent.length) * 10) / 10;
  }

  /**
   * Learning velocity: reviews per week for the last 8 weeks.
   * Returns array [oldest…newest].
   */
  static getLearningVelocity(history: ReviewHistoryItem[]): number[] {
    const weeks = 8;
    const buckets = Array(weeks).fill(0);
    const now = new Date();

    for (const item of history) {
      const daysAgo = daysBetween(item.reviewedAt, now);
      const weekIndex = weeks - 1 - Math.floor(daysAgo / 7);
      if (weekIndex >= 0 && weekIndex < weeks) {
        buckets[weekIndex]++;
      }
    }
    return buckets;
  }

  /**
   * Heatmap data: review session count per day for the last 365 days.
   */
  static getHeatmap(history: ReviewHistoryItem[]): HeatmapDay[] {
    const counts: Record<string, number> = {};
    for (const item of history) {
      const key = toDateString(item.reviewedAt);
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const days: HeatmapDay[] = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 364);
    for (let i = 0; i < 365; i++) {
      const key = toDateString(cursor);
      days.push({ date: key, sessions: counts[key] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  /**
   * Review streak: consecutive days ending today with at least 1 review.
   */
  static getReviewStreak(history: ReviewHistoryItem[]): number {
    const daySet = new Set(history.map(r => toDateString(r.reviewedAt)));
    let streak = 0;
    const cursor = new Date();

    while (true) {
      const key = toDateString(cursor);
      if (!daySet.has(key)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  /**
   * Compile full analytics object.
   */
  static compile(
    history: ReviewHistoryItem[],
    scheduleRecords: Array<{ lessonId: string; nextReview: Date; lastScore: number }>,
    lessonTitles: Record<string, string>,
    estimatedTime = 0,
  ): CoreRevisionAnalytics {
    const scheduleMap: Record<string, Date> = {};
    for (const r of scheduleRecords) {
      scheduleMap[r.lessonId] = r.nextReview;
    }

    return {
      retentionRate:    this.getRetentionRate(history, scheduleMap),
      forgottenLessons: this.getForgottenLessons(scheduleRecords),
      weakTopics:       this.getWeakTopics(history, lessonTitles),
      avgReviewScore:   this.getAvgReviewScore(history),
      learningVelocity: this.getLearningVelocity(history),
      reviewHistory:    [...history].sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime()),
      heatmap:          this.getHeatmap(history),
      totalReviews:     history.length,
      reviewStreak:     this.getReviewStreak(history),
      estimatedTime,
    };
  }
}

// --- Orchestrator: compose additional engines and return extended analytics
import * as studySessionEngine from './analytics/studySessionEngine';
import * as readinessEngine from './analytics/readinessEngine';
import * as trendEngine from './analytics/trendEngine';
import * as reportEngine from './analytics/reportEngine';
import * as instructorEngine from './analytics/instructorEngine';

export async function compileFullAnalytics(
  userId: string,
  history: ReviewHistoryItem[],
  scheduleRecords: Array<{ lessonId: string; nextReview: Date; lastScore: number }>,
  lessonTitles: Record<string, string>,
  estimatedTime = 0,
): Promise<RevisionAnalytics> {
  const base = RevisionEngine.compile(history, scheduleRecords, lessonTitles, estimatedTime);

  const timeSpent = await studySessionEngine.aggregateTimeSpent(userId, 8);
  const readinessScore = readinessEngine.computeReadinessScore(base);
  const completionTrends = await trendEngine.getCompletionTrends(userId, 8);
  const weeklyReport = reportEngine.compileWeeklyReport(userId, base, timeSpent);
  const instructor = await instructorEngine.getInstructorAggregates('default');

  return {
    ...base,
    timeSpent,
    readinessScore,
    completionTrends,
    weeklyReport,
    instructor,
  };
}

