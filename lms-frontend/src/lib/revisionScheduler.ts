/**
 * revisionScheduler.ts — LMS-Adapted Spaced Repetition Engine
 *
 * Unlike flashcard-focused SM-2, this scheduler uses lesson-context signals:
 *   - Self-reported confidence (1–5)  HIGH weight
 *   - Quiz score / mistakes           HIGH weight
 *   - Lesson difficulty               HIGH weight
 *   - Lesson version delta            triggers automatic re-review
 *   - Attempts + time spent           MEDIUM weight
 *
 * Intervals are fully configurable — tune cadence without touching application logic.
 */

// ─── Configurable Interval Constants ─────────────────────────────────────────
export const REVISION_INTERVALS = {
  FORGOT: 1,   // days — confidence 1
  HARD:   3,   // days — confidence 2
  OKAY:   7,   // days — confidence 3
  GOOD:   14,  // days — confidence 4
  EASY:   30,  // days — confidence 5
} as const;

export type Confidence = 1 | 2 | 3 | 4 | 5;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ScheduleRecord {
  userId:              string;
  lessonId:            string;
  interval:            number;   // days
  repetitions:         number;
  easeFactor:          number;
  nextReview:          Date;
  lastScore:           number;
  lessonVersion:       number;
  lastReviewedVersion: number;
}

export interface ReviewInput {
  lessonId:       string;
  confidence:     Confidence;    // 1–5
  quizScore?:     number;        // 0–100
  difficulty?:    'easy' | 'medium' | 'hard';
  attempts?:      number;
  mistakes?:      number;
  currentVersion: number;        // from metadata.json
}

export interface DueItem {
  lessonId:        string;
  nextReview:      Date;
  lastScore:       number;
  versionFlagged:  boolean;      // true if lesson updated since last review
  currentVersion:  number;
  reviewedVersion: number;
}

// ─── Interval Lookup ──────────────────────────────────────────────────────────
export function intervalFromConfidence(confidence: Confidence): number {
  const map: Record<Confidence, number> = {
    1: REVISION_INTERVALS.FORGOT,
    2: REVISION_INTERVALS.HARD,
    3: REVISION_INTERVALS.OKAY,
    4: REVISION_INTERVALS.GOOD,
    5: REVISION_INTERVALS.EASY,
  };
  return map[confidence];
}

/**
 * Adjusts raw confidence downward based on quiz signals.
 * A user who says "I'm confident (5)" but scored 40% gets bumped down.
 */
export function adjustConfidence(
  rawConfidence: Confidence,
  quizScore?: number,
  mistakes?: number,
  difficulty?: 'easy' | 'medium' | 'hard',
): Confidence {
  let adjusted = rawConfidence as number;

  if (quizScore !== undefined) {
    if (quizScore < 50) adjusted -= 2;
    else if (quizScore < 70) adjusted -= 1;
  }
  if (mistakes !== undefined && mistakes >= 3) adjusted -= 1;
  if (difficulty === 'hard') adjusted -= 1;

  return Math.max(1, Math.min(5, Math.round(adjusted))) as Confidence;
}

/**
 * Computes the next review date given a review outcome.
 * Returns the updated partial ScheduleRecord.
 */
export function computeNextSchedule(
  current: Pick<ScheduleRecord, 'interval' | 'repetitions' | 'easeFactor'>,
  input: ReviewInput,
): Pick<ScheduleRecord, 'interval' | 'repetitions' | 'easeFactor' | 'nextReview' | 'lastScore' | 'lastReviewedVersion'> {
  const effectiveConfidence = adjustConfidence(
    input.confidence,
    input.quizScore,
    input.mistakes,
    input.difficulty,
  );

  const days = intervalFromConfidence(effectiveConfidence);

  // Ease factor nudge (SM-2 inspired, bounded to [1.3, 3.0])
  const newEaseFactor = Math.max(
    1.3,
    Math.min(3.0, current.easeFactor + (0.1 - (5 - effectiveConfidence) * 0.08))
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + days);

  return {
    interval:            days,
    repetitions:         effectiveConfidence >= 3 ? current.repetitions + 1 : 0,
    easeFactor:          newEaseFactor,
    nextReview,
    lastScore:           effectiveConfidence,
    lastReviewedVersion: input.currentVersion,
  };
}

/**
 * Returns true if a lesson should be flagged for re-review
 * because its content has been updated since the user last reviewed it.
 */
export function isVersionFlagged(record: ScheduleRecord): boolean {
  return record.lessonVersion > record.lastReviewedVersion;
}

/**
 * Given a list of schedule records (from DB) and a lookup of current lesson versions,
 * returns items due today plus any version-flagged items.
 */
export function getDueItems(
  records: ScheduleRecord[],
  currentVersions: Record<string, number>,
): DueItem[] {
  const now = new Date();

  return records
    .map((r): DueItem => {
      const currentVersion = currentVersions[r.lessonId] ?? r.lessonVersion;
      const versionFlagged = currentVersion > r.lastReviewedVersion;
      return {
        lessonId:        r.lessonId,
        nextReview:      r.nextReview,
        lastScore:       r.lastScore,
        versionFlagged,
        currentVersion,
        reviewedVersion: r.lastReviewedVersion,
      };
    })
    .filter(item => item.nextReview <= now || item.versionFlagged)
    .sort((a, b) => {
      // Version-flagged items come first, then sorted by due date
      if (a.versionFlagged && !b.versionFlagged) return -1;
      if (!a.versionFlagged && b.versionFlagged) return 1;
      return a.nextReview.getTime() - b.nextReview.getTime();
    });
}

/**
 * Returns only lessons flagged due to content version changes.
 */
export function getVersionFlaggedLessons(
  records: ScheduleRecord[],
  currentVersions: Record<string, number>,
): DueItem[] {
  return getDueItems(records, currentVersions).filter(item => item.versionFlagged);
}

/**
 * Rough estimate of total revision time needed today.
 * Assumes ~8 minutes per overdue lesson, ~5 per version-flagged lesson.
 */
export function getEstimatedRevisionTime(
  records: ScheduleRecord[],
  currentVersions: Record<string, number>,
): number {
  const due = getDueItems(records, currentVersions);
  return due.reduce((total, item) => {
    return total + (item.versionFlagged && item.nextReview > new Date() ? 5 : 8);
  }, 0);
}
