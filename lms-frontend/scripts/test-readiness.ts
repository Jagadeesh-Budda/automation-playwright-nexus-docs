import { computeReadinessScore } from '../src/lib/analytics/readinessEngine';

function approxEqual(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

async function run() {
  const base = {
    retentionRate: 80,
    avgReviewScore: 4.0,
    reviewStreak: 3,
    learningVelocity: [1,2,3,4,5,6,7,8],
    weakTopics: [],
  } as any;

  const score = computeReadinessScore(base as any);
  console.log('readiness score:', score);
  if (typeof score !== 'number' || score < 0 || score > 100) {
    console.error('FAILED: readiness score out of bounds');
    process.exit(1);
  }

  // weak topics penalty should reduce score
  base.weakTopics = [{ lessonId: 'a' }, { lessonId: 'b' }, { lessonId: 'c' }];
  const worse = computeReadinessScore(base as any);
  console.log('readiness score with weak topics:', worse);
  if (worse >= score) {
    console.error('FAILED: expected weaker score when weak topics present');
    process.exit(1);
  }

  console.log('OK');
}

run().catch(e => { console.error(e); process.exit(1); });
