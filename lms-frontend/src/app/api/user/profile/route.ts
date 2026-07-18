import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.learningPreferences !== undefined) updateData.learningPreferences = data.learningPreferences;
    if (data.lastActivityDate !== undefined) updateData.lastActivityDate = data.lastActivityDate;
    if (data.todayMinutes !== undefined) updateData.todayMinutes = data.todayMinutes;
    if (data.totalMinutes !== undefined) updateData.totalMinutes = data.totalMinutes;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
