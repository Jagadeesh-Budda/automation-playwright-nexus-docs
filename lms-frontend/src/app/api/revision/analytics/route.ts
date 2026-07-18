import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { RevisionEngine, compileFullAnalytics } from '../../../../lib/revisionEngine';
import { getEstimatedRevisionTime, getDueItems } from '../../../../lib/revisionScheduler';
import modulesData from '../../../../data/metadata.json';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

function buildVersionMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const m of modulesData as any[]) {
    map[(m as any).id] = (m as any).version ?? 1;
  }
  return map;
}

function buildTitleMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const m of modulesData as any[]) {
    map[(m as any).id] = (m as any).title ?? (m as any).id;
  }
  return map;
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const currentVersions = buildVersionMap();
    const lessonTitles    = buildTitleMap();

    // Fetch schedule records
    const scheduleRaw = await prisma.revisionSchedule.findMany({ where: { userId } });
    const scheduleRecords = scheduleRaw.map(r => ({
      ...r,
      nextReview: new Date(r.nextReview),
    }));

    // Build review history from MasteryEvents (type = REVISION_REVIEW)
    const events = await prisma.masteryEvent.findMany({
      where: { userId, type: 'REVISION_REVIEW' },
      orderBy: { timestamp: 'desc' },
    });

    const reviewHistory = events.map(e => {
      const payload = JSON.parse(e.payload ?? '{}');
      return {
        lessonId:   e.moduleId ?? '',
        reviewedAt: new Date(e.timestamp),
        score:      payload.confidence ?? 3,
      };
    });

    const estimated = getEstimatedRevisionTime(scheduleRecords as any, currentVersions);

    // simple in-memory cache keyed by userId
    const cacheKey = `analytics:${userId}`;
    type CacheEntry = { ts: number; value: any };
    const cache: Map<string, CacheEntry> = (globalThis as any).__analytics_cache ||= new Map();
    const ttl = 1000 * 60 * 5; // 5 minutes

    const now = Date.now();
    const cached = cache.get(cacheKey);
    let analytics;
    if (cached && now - cached.ts < ttl) {
      analytics = cached.value;
    } else {
      analytics = await compileFullAnalytics(userId, reviewHistory, scheduleRecords as any, lessonTitles, estimated);
      cache.set(cacheKey, { ts: now, value: analytics });
    }

    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
