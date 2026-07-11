const { verifyToken } = require('../utils/jwt');

// Verifies a valid JWT is present and attaches the decoded payload to req.user.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Restricts a route to Super Admin only.
function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super Admin access required' });
  }
  next();
}

// Restricts a route to Org Admin only, and makes orgId available on req
function requireOrgAdmin(req, res, next) {
  if (req.user?.role !== 'orgadmin') {
    return res.status(403).json({ message: 'Organization Admin access required' });
  }
  req.orgId = req.user.organization;
  next();
}

module.exports = { requireAuth, requireSuperAdmin, requireOrgAdmin };
