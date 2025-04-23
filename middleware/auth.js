const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ msg: 'Token is invalid' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ msg: 'Admins only' });
  next();
};