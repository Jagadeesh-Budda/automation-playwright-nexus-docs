const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const CERT_SECRET = process.env.CERT_SECRET || 'asa-industrial-authority-secret-2026';

class Certificate {
    /**
     * Signs and creates a verifiable certificate record.
     */
    static async create(userId, name, certId, score, modulesVersion = '1.5.0') {
        const issuedAt = new Date().toISOString();
        
        // 1. Generate Verifiable HMAC Signature
        // Includes: userId, certId, score, issuedAt, modulesVersion
        const dataToSign = `${userId}|${certId}|${score}|${issuedAt}|${modulesVersion}`;
        const hash_signature = crypto
            .createHmac('sha256', CERT_SECRET)
            .update(dataToSign)
            .digest('hex');

        // 2. Store in DB
        return await prisma.certificate.create({
            data: {
                certId,
                name,
                signature: hash_signature,
                user_id: userId,
                hash_signature, // Legacy field for reverse compatibility
                validation_url: `https://verify.asaauthority.com/verify/${certId}`,
                issuedAt: new Date(issuedAt)
            }
        });
    }

    static async getByUserId(userId) {
        return await prisma.certificate.findFirst({
            where: { user_id: userId }
        });
    }

    static verifySignature(certData, signature) {
        const dataToSign = `${certData.user_id}|${certData.certId}|${certData.score}|${certData.issuedAt}|${certData.modulesVersion}`;
        const expected = crypto
            .createHmac('sha256', CERT_SECRET)
            .update(dataToSign)
            .digest('hex');
        return expected === signature;
    }
}

module.exports = Certificate;
