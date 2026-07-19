import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = "student_1";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const userName = request.headers.get('x-user-name') || "Test Student";
    const { moduleId, score, failedObjectives = "" } = await request.json();

    if (!moduleId || score === undefined) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`,
            name: userName,
          }
        });
      } catch (error: any) {
        if (error?.code !== 'P2002') {
          throw error;
        }
        user = await prisma.user.findUnique({ where: { id: userId } });
      }
    }

    // Upsert the progress
    const progress = await prisma.userProgress.upsert({
      where: {
        user_id_module_id: {
          user_id: userId,
          module_id: moduleId
        }
      },
      update: {
        score: score,
        attempts: { increment: 1 },
        failed_objectives: failedObjectives
      },
      create: {
        user_id: userId,
        module_id: moduleId,
        score: score,
        attempts: 1,
        failed_objectives: failedObjectives
      }
    });

    // Log a telemetry execution event
    await prisma.masteryEvent.create({
      data: {
        type: "TEST_RUN",
        userId: userId,
        moduleId: moduleId,
        payload: JSON.stringify({ score })
      }
    });

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const userName = request.headers.get('x-user-name') || "Student";
    
    // Ensure user exists
    let user: any = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`,
            name: userName,
          }
        }) as any;
      } catch (error: any) {
        if (error?.code !== 'P2002') {
          throw error;
        }
        user = await prisma.user.findUnique({ where: { id: userId } }) as any;
      }
    }

    const progress = await prisma.userProgress.findMany({
      where: { user_id: userId }
    });

    return NextResponse.json({ 
      success: true, 
      progress,
      profile: {
        name: user.name,
        learningPreferences: user.learningPreferences,
        lastActivityDate: user.lastActivityDate,
        todayMinutes: user.todayMinutes,
        totalMinutes: user.totalMinutes
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

