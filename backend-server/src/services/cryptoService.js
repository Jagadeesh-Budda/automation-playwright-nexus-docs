const crypto = require('crypto');

/**
 * Service to handle cryptographic signing and verification.
 */
class CryptoService {
    constructor() {
        this.secretKey = process.env.ASA_PRIVATE_KEY;
        if (!this.secretKey) {
            throw new Error("CRITICAL: ASA_PRIVATE_KEY is missing from environment variables.");
        }
    }

    /**
     * Generates a deterministic SHA-256 signature for a certificate.
     */
    generateSignature(certId, candidateName) {
        // Concatenate data to form the payload
        const payload = `${certId}:${candidateName}:${this.secretKey}`;
        
        return crypto
            .createHash('sha256')
            .update(payload)
            .digest('hex');
    }

    /**
     * Generates a cryptographically random, unique Certificate ID
     */
    generateUniqueId() {
        // e.g., PS-MASTERY-A1B2C3D4
        const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `ASA-CERT-${randomHex}`;
    }
}

module.exports = new CryptoService();
