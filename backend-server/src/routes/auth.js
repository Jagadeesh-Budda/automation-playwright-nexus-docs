const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_jwt_key_123';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'fallback_refresh_secret_key_456';

const generateTokens = async (user) => {
    const accessToken = jwt.sign(
        { email: user.email, name: user.name, id: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '15m' } // Short-lived
    );

    const refreshTokenStr = jwt.sign(
        { id: user.id }, 
        REFRESH_SECRET, 
        { expiresIn: '7d' }
    );

    // Store Refresh Token in DB for revocation support
    await prisma.refreshToken.create({
        data: {
            token: refreshTokenStr,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    return { accessToken, refreshToken: refreshTokenStr };
};

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        await User.updateOne({ email }, { otp: null, otpExpiry: null });

        const tokens = await generateTokens(user);

        res.status(200).json({ 
            message: "Login successful", 
            ...tokens,
            user: { name: user.name, email: user.email, id: user.id, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

    try {
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });

        if (!storedToken || new Date() > storedToken.expiresAt) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = await User.findOne({ id: decoded.id });

        if (!user) return res.status(404).json({ error: "User not found" });

        // Rotate Tokens
        await prisma.refreshToken.delete({ where: { token: refreshToken } });
        const tokens = await generateTokens(user);

        res.json(tokens);
    } catch (err) {
        res.status(403).json({ error: "Invalid refresh token" });
    }
});

module.exports = router;
