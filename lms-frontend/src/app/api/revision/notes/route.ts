import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

// GET — list all notes for user (optionally filter by lessonId query param)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    const notes = await prisma.userNote.findMany({
      where: lessonId ? { userId, lessonId } : { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — create a new note (multiple notes per lesson allowed)
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { lessonId, title = 'Untitled note', content } = await request.json();

    if (!lessonId || content === undefined) {
      return NextResponse.json({ success: false, error: 'lessonId and content required' }, { status: 400 });
    }

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@example.com`, name: 'Student' },
    });

    const note = await prisma.userNote.create({
      data: { userId, lessonId, title, content },
    });
    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
