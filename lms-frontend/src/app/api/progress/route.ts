import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
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
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com`,
          name: userName,
        }
      });
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
    const progress = await prisma.userProgress.findMany({
      where: { user_id: userId }
    });
    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

