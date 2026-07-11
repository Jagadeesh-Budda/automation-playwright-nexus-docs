const express = require('express');
const router = express.Router();
const cryptoService = require('../services/cryptoService');
const dbService = require('../services/dbService');

/**
 * GET /api/verify
 * Query params: ?id=...&sig=...
 * Validates the existence and integrity of a certificate.
 */
router.get('/verify', async (req, res) => {
    try {
        const { id, sig } = req.query;

        if (!id || !sig) {
            return res.status(400).json({ 
                status: 'INVALID', 
                error: 'Missing required parameters: id and sig' 
            });
        }

        // 1. Check if ID exists in the database
        const record = await dbService.getCertificate(id);

        if (!record) {
            return res.status(404).json({ 
                status: 'INVALID', 
                error: 'Certificate ID not found in registry (REGISTRY_MISS)' 
            });
        }

        // 2. Cryptographic Validation
        // Recompute the expected signature using the DB record and backend SECRET
        const expectedSignature = cryptoService.generateSignature(id, record.name);

        if (expectedSignature !== sig) {
            // Signature mismatch indicates tampering or a fake signature
            return res.status(401).json({ 
                status: 'INVALID', 
                error: 'Cryptographic signature mismatch (INTEGRITY_FAILURE)' 
            });
        }

        // 3. Lifecycle Validation
        if (record.status !== 'ACTIVE') {
            return res.status(403).json({
                status: 'INVALID',
                error: `Certificate status is ${record.status}`
            });
        }

        // SUCCESS!
        res.status(200).json({
            status: 'VERIFIED',
            certId: id,
            name: record.name,
            issueDate: record.issueDate
        });

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ error: 'Internal Server Error during verification.' });
    }
});

module.exports = router;
