import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
  const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
  res.json(profile || {});
});

router.put('/', authenticateToken, (req, res) => {
  const fields = ['business_name', 'abn', 'licence_number', 'phone', 'email', 'address', 'logo', 'payment_terms', 'bank_details', 'trade_type'];
  const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (updates.length) {
    updates.push("updated_at = datetime('now')");
    values.push(profile.id);
    db.prepare(`UPDATE business_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  const updated = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
  res.json(updated);
});

export default router;
