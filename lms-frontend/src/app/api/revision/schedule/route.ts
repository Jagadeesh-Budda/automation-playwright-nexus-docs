import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import modulesData from '../../../../data/metadata.json';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

// Build a map of lessonId → version from metadata.json
function buildVersionMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const m of modulesData as any[]) {
    map[m.id] = (m as any).version ?? 1;
  }
  return map;
}

// GET — return due items (by date + version flag) for today
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const currentVersions = buildVersionMap();

    const records = await prisma.revisionSchedule.findMany({
      where: { userId },
      orderBy: { nextReview: 'asc' },
    });

    const now = new Date();
    const due = records.filter(r => {
      const isDue = r.nextReview <= now;
      const versionFlagged = (currentVersions[r.lessonId] ?? 1) > r.lastReviewedVersion;
      return isDue || versionFlagged;
    });

    const enriched = due.map(r => ({
      ...r,
      versionFlagged: (currentVersions[r.lessonId] ?? 1) > r.lastReviewedVersion,
      currentVersion: currentVersions[r.lessonId] ?? 1,
    }));

    return NextResponse.json({ success: true, records, due: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
