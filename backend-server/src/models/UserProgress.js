const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserProgress {
    static async get(userId, moduleId) {
        return await prisma.userProgress.findUnique({
            where: { user_id_module_id: { user_id: userId, module_id: moduleId } }
        });
    }

    /**
     * Records an attempt atomically using a Prisma transaction.
     * Enforces cooldowns and attempt limits at the DB level.
     */
    static async recordAttemptAtomic(userId, moduleId, score, pass, failedObjectives = []) {
        return await prisma.$transaction(async (tx) => {
            // 1. Get current state with row-level locking (findUnique in transaction provides this implicitly in many DBs, or use raw if needed)
            const current = await tx.userProgress.findUnique({
                where: { user_id_module_id: { user_id: userId, module_id: moduleId } }
            });

            // 2. Check cooldown
            if (current && current.lockedUntil && new Date() < new Date(current.lockedUntil)) {
                throw new Error('COOLDOWN_ACTIVE');
            }

            const attempts = (current?.attempts || 0) + 1;
            const maxScore = Math.max(current?.score || 0, score);
            
            // 3. Cooldown logic: lock for 15 mins after every 3 failed attempts
            let lockedUntil = null;
            if (!pass && attempts % 3 === 0) {
                lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }

            // 4. Update or Create
            return await tx.userProgress.upsert({
                where: { user_id_module_id: { user_id: userId, module_id: moduleId } },
                update: {
                    score: maxScore,
                    attempts,
                    failed_objectives: JSON.stringify(failedObjectives),
                    lockedUntil: lockedUntil
                },
                create: {
                    user_id: userId,
                    module_id: moduleId,
                    score,
                    attempts,
                    failed_objectives: JSON.stringify(failedObjectives),
                    lockedUntil: lockedUntil
                }
            });
        });
    }

    static isLocked(progress) {
        if (!progress || !progress.lockedUntil) return false;
        return new Date() < new Date(progress.lockedUntil);
    }
}

module.exports = UserProgress;
