/**
 * ASA AUTHORITY ENGINE
 * 
 * This file interfaces with the secure Node.js backend.
 * All cryptographic verification happens on the server.
 */

const AuthorityEngine = (function() {
    return {
        /**
         * Calls the secure backend: GET /api/verify?id=...&sig=...
         */
        async verifyHandshake(certId, urlSig) {
            try {
                const response = await fetch(`http://localhost:3000/api/verify?id=${encodeURIComponent(certId)}&sig=${encodeURIComponent(urlSig)}`);
                const data = await response.json();
                
                if (response.ok && data.status === "VERIFIED") {
                    return {
                        status: 'VERIFIED',
                        candidate: data.name,
                        id: data.certId,
                        issueDate: data.issueDate,
                        expiryDate: data.expiryDate || "Never",
                        notes: "Cryptographically secured via Node.js Backend."
                    };
                } else {
                    return { 
                        status: 'DENIED', 
                        code: 'INTEGRITY_FAILURE', 
                        message: data.error || 'Cryptographic signature mismatch or record not found.' 
                    };
                }

            } catch (err) {
                console.error("Verification API Error:", err);
                return { status: 'ERROR', code: 'SYSTEM_FAULT', message: 'Authority Engine is currently offline or unreachable. Is the backend running?' };
            }
        }
    };
})();
