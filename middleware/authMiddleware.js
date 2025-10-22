const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (role) => async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check role if specified
        if (role && decoded.role !== role) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
