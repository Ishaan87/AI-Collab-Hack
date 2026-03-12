import jwt from 'jsonwebtoken';

// Like auth middleware but doesn't reject — just attaches user if token present
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Invalid token — just skip, don't reject
  }
  next();
};

export default optionalAuth;
