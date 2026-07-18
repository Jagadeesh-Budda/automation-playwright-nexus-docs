import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

// GET — list highlights for user (optionally filter by lessonId)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    const highlights = await prisma.userHighlight.findMany({
      where: lessonId ? { userId, lessonId } : { userId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, highlights });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — add a highlight
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { lessonId, paragraphId, anchorText, focusText, occurrenceIndex = 0, color = 'yellow' } = await request.json();

    if (!lessonId || !paragraphId || !anchorText || !focusText) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@example.com`, name: 'Student' },
    });

    const highlight = await prisma.userHighlight.create({
      data: { userId, lessonId, paragraphId, anchorText, focusText, occurrenceIndex, color },
    });
    return NextResponse.json({ success: true, highlight }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
