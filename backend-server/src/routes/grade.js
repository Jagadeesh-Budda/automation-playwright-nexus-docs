const express = require('express');
const router = express.Router();
const gradingService = require('../services/gradingService');
const UserProgress = require('../models/UserProgress');
const { requireAuth } = require('../middleware/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * POST /api/grade
 * Body: { moduleId: string, answers: { questionId: string }, idempotencyKey?: string }
 */
router.post('/grade', requireAuth, async (req, res) => {
    try {
        const { moduleId, answers, idempotencyKey } = req.body;
        const userId = req.user.id;

        if (!moduleId || !answers) {
            return res.status(400).json({ error: 'Invalid payload.' });
        }

        // 1. Check Idempotency Key
        if (idempotencyKey) {
            const existingKey = await prisma.idempotencyKey.findUnique({
                where: { key: idempotencyKey }
            });
            if (existingKey) {
                // Return previous result (In a real app, you'd store the response body too)
                return res.status(200).json({ message: 'Duplicate request ignored' });
            }
            await prisma.idempotencyKey.create({
                data: { key: idempotencyKey, userId }
            });
        }

        // 2. Check Locks/Cooldowns
        const progress = await UserProgress.get(userId, moduleId);
        if (UserProgress.isLocked(progress)) {
            return res.status(403).json({ error: 'Mastery Gate Locked' });
        }

        // 3. Grade Securely
        const result = gradingService.gradeModule(moduleId, answers);

        // 4. Record Atomically
        await UserProgress.recordAttemptAtomic(
            userId, 
            moduleId, 
            result.score, 
            result.pass, 
            result.details ? Object.keys(result.details).filter(k => result.details[k] === 'INCORRECT') : []
        );

        // 5. Log Event
        await prisma.masteryEvent.create({
            data: {
                type: result.pass ? 'assessment_pass' : 'assessment_fail',
                userId,
                moduleId,
                payload: JSON.stringify({ score: result.score })
            }
        });

        res.status(200).json({
            moduleId,
            score: result.score,
            pass: result.pass,
            attempts: (progress?.attempts || 0) + 1
        });

    } catch (error) {
        if (error.message === 'COOLDOWN_ACTIVE') {
            return res.status(403).json({ error: 'Cooldown active' });
        }
        console.error('Grading Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
