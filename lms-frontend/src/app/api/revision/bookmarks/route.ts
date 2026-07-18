import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

// GET — list all bookmarks for the authenticated user
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const bookmarks = await prisma.userBookmark.findMany({
      where: { userId },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, bookmarks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — create/toggle bookmark
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { lessonId } = await request.json();
    if (!lessonId) {
      return NextResponse.json({ success: false, error: 'lessonId required' }, { status: 400 });
    }

    // Ensure user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      try {
        await prisma.user.create({
          data: { id: userId, email: `${userId}@example.com`, name: 'Student' },
        });
      } catch (error: any) {
        // Ignore duplicate create race conditions
        if (error?.code !== 'P2002') {
          throw error;
        }
      }
    }

    const bookmark = await prisma.userBookmark.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    });
    return NextResponse.json({ success: true, bookmark });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
