import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

// DELETE — remove a highlight by id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const { id } = await params;

    const highlight = await prisma.userHighlight.findUnique({ where: { id } });
    if (!highlight || highlight.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Not found or forbidden' }, { status: 404 });
    }

    await prisma.userHighlight.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
