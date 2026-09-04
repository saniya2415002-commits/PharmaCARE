const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'lifecore_super_secret_key_12345';

// Optional Authentication Middleware (populates req.user if token is valid)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
}

// Strictly Required Authentication Middleware (rejects request if not authenticated)
function requireAuth(req, res, next) {
    authenticateToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Please login first.' });
        }
        next();
    });
}

module.exports = {
    authenticateToken,
    requireAuth,
    JWT_SECRET
};
