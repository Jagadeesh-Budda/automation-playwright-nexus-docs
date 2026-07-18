import { NextResponse } from 'next/server';
import * as study from '../../../../lib/analytics/studySessionEngine';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.userId || !body?.minutes || !body?.startedAt || !body?.endedAt) {
      return NextResponse.json({ success: false, error: 'invalid payload' }, { status: 400 });
    }

    const rec = await study.ingestStudySession(body);

    // invalidate analytics cache for the user
    const cache: Map<string, any> = (globalThis as any).__analytics_cache;
    if (cache) cache.delete(`analytics:${body.userId}`);

    return NextResponse.json({ success: true, record: rec });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
