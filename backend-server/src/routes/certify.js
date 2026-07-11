const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const UserProgress = require('../models/UserProgress');
const { requireAuth } = require('../middleware/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/certify', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const name = req.user.name;

        // 1. Verify Mastery Integrity: Check if ALL required modules are completed in DB
        // Fetch all modules from a common source or hardcode count for now (14)
        const progressCount = await prisma.userProgress.count({
            where: { user_id: userId, score: { gte: 70 } }
        });

        if (progressCount < 14) {
            return res.status(403).json({ 
                error: 'Incomplete Mastery', 
                message: `You have only mastered ${progressCount}/14 modules. Complete all technical layers to claim certification.`
            });
        }

        // 2. Check if already certified
        let cert = await Certificate.getByUserId(userId);
        if (cert) {
            return res.status(200).json(cert);
        }

        // 3. Generate Unique Certificate
        const certId = `ASA-UI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Calculate average score for snapshot
        const allProgress = await prisma.userProgress.findMany({ where: { user_id: userId } });
        const avgScore = Math.round(allProgress.reduce((acc, p) => acc + p.score, 0) / allProgress.length);

        cert = await Certificate.create(userId, name, certId, avgScore);

        res.status(201).json(cert);

    } catch (error) {
        console.error('Certification Error:', error);
        res.status(500).json({ error: 'Internal Server Error during certification.' });
    }
});

module.exports = router;
