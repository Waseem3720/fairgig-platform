const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'fairgig-secret-key-softec-2026-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ detail: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
    req.user = {
      id: parseInt(decoded.sub),
      role: decoded.role || 'worker',
    };
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ detail: `Access denied. Required: ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
