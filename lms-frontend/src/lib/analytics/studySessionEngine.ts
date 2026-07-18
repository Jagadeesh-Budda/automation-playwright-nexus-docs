import { prisma } from '../../lib/prisma';

export async function ingestStudySession(payload: {
  userId: string;
  lessonId?: string | null;
  minutes: number;
  startedAt: string;
  endedAt: string;
}) {
  const rec = await prisma.studySession.create({ data: {
    userId: payload.userId,
    lessonId: payload.lessonId ?? null,
    minutes: payload.minutes,
    startedAt: new Date(payload.startedAt),
    endedAt: new Date(payload.endedAt),
  }});
  return rec;
}

export async function aggregateTimeSpent(userId: string, weeks = 8) {
  // return daily and weekly aggregates for the last `weeks` weeks
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const sessions = await prisma.studySession.findMany({
    where: { userId, startedAt: { gte: since } },
    orderBy: { startedAt: 'asc' },
  });

  const daily: Record<string, number> = {};
  for (const s of sessions) {
    const key = s.startedAt.toISOString().split('T')[0];
    daily[key] = (daily[key] ?? 0) + (s.minutes ?? 0);
  }

  // weekly totals (ISO week buckets simple rolling 7-day windows ending today)
  const weekly: number[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i * 7 - 6);
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    let total = 0;
    for (const s of sessions) {
      if (s.startedAt >= start && s.startedAt <= end) total += s.minutes ?? 0;
    }
    weekly.push(total);
  }

  return { daily, weekly };
}
