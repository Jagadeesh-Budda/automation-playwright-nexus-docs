const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const Progress = require('../models/Progress');

router.post('/progress', requireAuth, async (req, res) => {
    try {
        const userId = req.user.email;
        const { state, version } = req.body;

        if (!state) return res.status(400).json({ error: 'State required' });

        // Last-write-wins with server as authority
        const updatedProgress = await Progress.findOneAndUpdate(
            { userId },
            { state, updatedAt: new Date() },
            { upsert: true }
        );

        // Always return the authoritative state back to the client
        res.status(200).json({ 
            message: 'Progress synced',
            authoritativeState: updatedProgress.state 
        });

    } catch (err) {
        res.status(500).json({ error: 'Sync failed' });
    }
});

module.exports = router;
