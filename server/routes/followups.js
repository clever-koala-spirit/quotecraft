import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();
router.use(authenticateToken);

// Create followup
router.post('/', (req, res) => {
  const id = uuid();
  const { client_id, quote_id, job_id, title, due_date, notes } = req.body;
  if (!title || !due_date) return res.status(400).json({ error: 'Title and due_date required' });

  db.prepare(`INSERT INTO followups (id, user_id, client_id, quote_id, job_id, title, due_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, req.user.id, client_id || null, quote_id || null, job_id || null, title, due_date, notes || null
  );

  res.json(getFollowupWithDetails(id));
});

// List followups
router.get('/', (req, res) => {
  const { filter } = req.query;
  let sql = `SELECT f.*, c.name as client_name FROM followups f
    LEFT JOIN clients c ON f.client_id = c.id WHERE f.user_id = ?`;
  const params = [req.user.id];

  const today = new Date().toISOString().split('T')[0];
  if (filter === 'overdue') {
    sql += ' AND f.completed = 0 AND f.due_date < ?';
    params.push(today);
  } else if (filter === 'today') {
    sql += ' AND f.completed = 0 AND f.due_date = ?';
    params.push(today);
  } else if (filter === 'upcoming') {
    sql += ' AND f.completed = 0 AND f.due_date > ?';
    params.push(today);
  } else if (filter === 'active') {
    sql += ' AND f.completed = 0';
  }

  sql += ' ORDER BY f.due_date ASC';
  res.json(db.prepare(sql).all(...params));
});

// Update / complete followup
router.put('/:id', (req, res) => {
  const followup = db.prepare('SELECT * FROM followups WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!followup) return res.status(404).json({ error: 'Not found' });

  const { title, due_date, notes, completed } = req.body;
  const updates = [];
  const vals = [];

  if (title !== undefined) { updates.push('title = ?'); vals.push(title); }
  if (due_date !== undefined) { updates.push('due_date = ?'); vals.push(due_date); }
  if (notes !== undefined) { updates.push('notes = ?'); vals.push(notes); }
  if (completed !== undefined) {
    updates.push('completed = ?');
    vals.push(completed ? 1 : 0);
    if (completed) updates.push("completed_at = datetime('now')");
    else updates.push('completed_at = NULL');
  }

  if (updates.length) {
    vals.push(req.params.id);
    db.prepare(`UPDATE followups SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  }

  res.json(getFollowupWithDetails(req.params.id));
});

// Delete followup
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM followups WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

function getFollowupWithDetails(id) {
  return db.prepare(`SELECT f.*, c.name as client_name FROM followups f
    LEFT JOIN clients c ON f.client_id = c.id WHERE f.id = ?`).get(id);
}

export default router;
