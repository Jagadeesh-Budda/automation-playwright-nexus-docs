import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { computeNextSchedule, adjustConfidence } from '../../../../../lib/revisionScheduler';
import modulesData from '../../../../../data/metadata.json';
import type { Confidence } from '../../../../../lib/revisionScheduler';

export const dynamic = 'force-dynamic';
const DEFAULT_USER_ID = 'student_1';

function getLessonVersion(lessonId: string): number {
  const module = (modulesData as any[]).find((m: any) => m.id === lessonId);
  return module?.version ?? 1;
}

// POST — record a review outcome and compute next schedule
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || DEFAULT_USER_ID;
    const {
      lessonId,
      confidence,
      quizScore,
      difficulty,
      attempts,
      mistakes,
    } = await request.json();

    if (!lessonId || confidence === undefined) {
      return NextResponse.json({ success: false, error: 'lessonId and confidence required' }, { status: 400 });
    }

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@example.com`, name: 'Student' },
    });

    const currentVersion = getLessonVersion(lessonId);

    // Fetch existing record or use defaults
    const existing = await prisma.revisionSchedule.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    const current = {
      interval:    existing?.interval    ?? 1,
      repetitions: existing?.repetitions ?? 0,
      easeFactor:  existing?.easeFactor  ?? 2.5,
    };

    const next = computeNextSchedule(current, {
      lessonId,
      confidence: confidence as Confidence,
      quizScore,
      difficulty,
      attempts,
      mistakes,
      currentVersion,
    });

    const schedule = await prisma.revisionSchedule.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        interval:            next.interval,
        repetitions:         next.repetitions,
        easeFactor:          next.easeFactor,
        nextReview:          next.nextReview,
        lastScore:           next.lastScore,
        lessonVersion:       currentVersion,
        lastReviewedVersion: next.lastReviewedVersion,
      },
      create: {
        userId,
        lessonId,
        interval:            next.interval,
        repetitions:         next.repetitions,
        easeFactor:          next.easeFactor,
        nextReview:          next.nextReview,
        lastScore:           next.lastScore,
        lessonVersion:       currentVersion,
        lastReviewedVersion: currentVersion,
      },
    });

    // Log review for analytics history
    await prisma.masteryEvent.create({
      data: {
        type:     'REVISION_REVIEW',
        userId,
        moduleId: lessonId,
        payload:  JSON.stringify({ confidence, quizScore, difficulty, attempts, mistakes }),
      },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
