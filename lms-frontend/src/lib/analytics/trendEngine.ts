import { prisma } from '../../lib/prisma';

export async function getCompletionTrends(userId: string, weeks = 8) {
  // Placeholder: count UserProgress updates per week as "started/in-progress/completed"
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const progresses = await prisma.userProgress.findMany({ where: { user_id: userId } });

  // Very lightweight summary: module completion percentages (static snapshot)
  const map: Record<string, { score: number; attempts: number }> = {};
  for (const p of progresses) {
    map[p.module_id] = { score: p.score, attempts: p.attempts };
  }

  return { modules: map };
}
