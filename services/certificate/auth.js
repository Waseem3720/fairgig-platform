const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'fairgig-secret-key-softec-2026-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
    req.user = {
      id: parseInt(decoded.sub),
      role: decoded.role || 'worker',
    };
    req.token = token; // keeping token to pass along to earnings API
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };
