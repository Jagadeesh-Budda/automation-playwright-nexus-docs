const express = require('express');
const router = express.Router();
const astService = require('../services/astService');
const domVariantService = require('../services/domVariantService');

/**
 * GET /api/validate-code/variant/:questionId
 * Returns a random controlled DOM variant to the frontend to construct the IDE.
 */
router.get('/validate-code/variant/:questionId', (req, res) => {
    try {
        const { questionId } = req.params;
        const variant = domVariantService.getRandomVariant(questionId);
        
        if (!variant) {
            return res.status(404).json({ error: 'No DOM variants found for this question.' });
        }
        
        // Strip out the contract grading secrets before sending to frontend
        const safeVariant = {
            variantId: variant.variantId,
            html: variant.html
        };
        
        res.status(200).json(safeVariant);
    } catch (err) {
        console.error('DOM Variant Error:', err);
        res.status(500).json({ error: 'Failed to fetch DOM variant.' });
    }
});

/**
 * POST /api/validate-code
 * Body: { code: string, questionId: string, variantId: string }
 * Validates Playwright test code using semantic AST and DOM contracts.
 */
router.post('/validate-code', (req, res) => {
    try {
        const { code, poCode, specCode, rationale, questionId, variantId } = req.body;

        // Multi-file Architecture Validation
        if (poCode && specCode) {
            const result = astService.validateArchitecture(poCode, specCode);
            return res.status(200).json(result);
        }

        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                valid: false,
                issues: ['Code payload is missing or invalid.']
            });
        }

        // Validate rationale presence
        if (!rationale || !rationale.issue || !rationale.fix) {
            return res.status(400).json({
                valid: false,
                issues: ['Rationale (Problem/Fix) is mandatory for validation.']
            });
        }

        // Contract Lookup
        let contract = null;
        if (questionId && variantId) {
            const variants = domVariantService.getQuestionVariants(questionId);
            const variant = variants.find(v => v.variantId === variantId);
            if (variant) {
                contract = variant.contract;
            }
        }

        const result = astService.validatePlaywrightCode(code, rationale, contract);

        res.status(200).json(result);

    } catch (error) {
        console.error('AST Validation Error:', error);
        res.status(500).json({
            valid: false,
            issues: ['Internal Server Error during code validation.']
        });
    }
});

module.exports = router;
