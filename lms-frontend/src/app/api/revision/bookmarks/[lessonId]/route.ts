import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

// PATCH — update pinned state
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { pinned } = await request.json();
    const { lessonId } = await params;
    const decodedId = decodeURIComponent(lessonId);

    const updated = await prisma.userBookmark.updateMany({
      where: { userId, lessonId: decodedId },
      data: { pinned: Boolean(pinned) },
    });
    return NextResponse.json({ success: true, count: updated.count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — remove bookmark
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { lessonId } = await params;
    const decodedId = decodeURIComponent(lessonId);

    await prisma.userBookmark.deleteMany({ where: { userId, lessonId: decodedId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
