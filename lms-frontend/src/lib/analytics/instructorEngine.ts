import { prisma } from '../../lib/prisma';

export async function getInstructorAggregates(courseId: string) {
  // Placeholder: return empty aggregates — to be expanded for cohorts
  return {
    hardestLessons: [],
    avgCompletion: {},
    dropOffLocations: [],
    avgQuizScores: {},
    avgStudyTime: {},
  };
}
