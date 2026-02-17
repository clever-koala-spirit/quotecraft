import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });
    const id = uuid();
    const hashed = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(id, email, hashed);
    db.prepare('INSERT INTO business_profiles (id, user_id) VALUES (?, ?)').run(uuid(), id);
    const token = generateToken({ id, email });
    res.json({ token, user: { id, email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export default router;
