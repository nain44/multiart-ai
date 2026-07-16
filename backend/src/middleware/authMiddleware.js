const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT Bearer token from the Authorization header.
 * Attaches the decoded payload to req.admin on success.
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Token invalid or expired' });
  }
};
