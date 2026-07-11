import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
const DEFAULT_USER_ID = "student_1";

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;

    // Fetch test runs from past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const events = await prisma.masteryEvent.findMany({
      where: {
        userId: userId,
        type: "TEST_RUN",
        timestamp: { gte: sevenDaysAgo }
      },
      orderBy: { timestamp: 'asc' }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: Record<string, number> = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };

    events.forEach(event => {
      const dayIndex = new Date(event.timestamp).getDay();
      const dayName = dayNames[dayIndex];
      if (counts[dayName] !== undefined) {
        counts[dayName]++;
      }
    });

    return NextResponse.json({ success: true, counts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
