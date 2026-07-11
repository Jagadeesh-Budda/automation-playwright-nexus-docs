const Certificate = require('../models/Certificate');

/**
 * Database Service using MongoDB.
 */
class DatabaseService {
    async saveCertificate(certData) {
        try {
            await Certificate.create({
                certId: certData.id,
                name: certData.name,
                signature: certData.signature,
                status: 'ACTIVE'
            });
            return true;
        } catch (err) {
            console.error("DB Save Error:", err);
            throw err;
        }
    }

    async getCertificate(certId) {
        try {
            const cert = await Certificate.findOne({ certId });
            if (!cert) return null;
            return {
                name: cert.name,
                issueDate: cert.issuedAt.toISOString(),
                status: cert.status,
                signature: cert.signature
            };
        } catch (err) {
            console.error("DB Get Error:", err);
            throw err;
        }
    }
}

module.exports = new DatabaseService();
