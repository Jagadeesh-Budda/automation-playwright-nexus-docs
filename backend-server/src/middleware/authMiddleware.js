const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_jwt_key_123';

/**
 * Middleware to protect API routes.
 * Requires a valid JWT token in the Authorization header.
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        const decodedPayload = jwt.verify(token, JWT_SECRET);
        
        // Attach user info to the request object so the protected route can use it
        req.user = decodedPayload; 
        
        // Pass control to the next middleware or route handler
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
}

module.exports = { requireAuth };
