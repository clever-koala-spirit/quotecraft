import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'qc_s3cr3t_k3y_2026_xK9mPqL7vR2nT5wB';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}
