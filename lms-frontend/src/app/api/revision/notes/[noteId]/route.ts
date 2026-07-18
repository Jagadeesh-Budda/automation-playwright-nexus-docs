import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

// PATCH — update note title and/or content (last-write-wins via updatedAt)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { title, content } = await request.json();
    const { noteId } = await params;

    const note = await prisma.userNote.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Not found or forbidden' }, { status: 404 });
    }

    const updated = await prisma.userNote.update({
      where: { id: noteId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });
    return NextResponse.json({ success: true, note: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — delete a specific note by id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { noteId } = await params;

    const note = await prisma.userNote.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Not found or forbidden' }, { status: 404 });
    }

    await prisma.userNote.delete({ where: { id: noteId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
