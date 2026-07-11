import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';


export async function POST(request: Request) {
  try {
    const { userId, userName, progress } = await request.json();

    if (!userId || !progress || !Array.isArray(progress)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    // 1. Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com`,
          name: userName || "Test Student",
        }
      });
    } else if (userName && user.name !== userName) {
      // Keep name synchronized if it changed
      await prisma.user.update({
        where: { id: userId },
        data: { name: userName }
      });
    }

    // 2. Import progress records using upsert
    const upsertPromises = progress.map((p: any) => {
      if (!p.moduleId || p.score === undefined) return Promise.resolve();
      return prisma.userProgress.upsert({
        where: {
          user_id_module_id: {
            user_id: userId,
            module_id: p.moduleId
          }
        },
        update: {
          // Store highest score or update score directly
          score: p.score,
          attempts: { increment: 1 },
          failed_objectives: p.failedObjectives || ""
        },
        create: {
          user_id: userId,
          module_id: p.moduleId,
          score: p.score,
          attempts: 1,
          failed_objectives: p.failedObjectives || ""
        }
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ success: true, message: `Successfully synchronized ${progress.length} records.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
