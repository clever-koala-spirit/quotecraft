import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';
import { addTimeline } from './clients.js';

const router = Router();
router.use(authenticateToken);

// Create job
router.post('/', (req, res) => {
  const id = uuid();
  const { client_id, quote_id, title, description, stage, value, scheduled_date, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  db.prepare(`INSERT INTO jobs (id, user_id, client_id, quote_id, title, description, stage, value, scheduled_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, req.user.id, client_id || null, quote_id || null, title,
    description || null, stage || 'lead', value || 0, scheduled_date || null, notes || null
  );

  if (client_id) {
    addTimeline(client_id, req.user.id, 'note', `Job created: ${title}`);
  }

  res.json(getJobWithDetails(id));
});

// List jobs
router.get('/', (req, res) => {
  const { stage, client_id } = req.query;
  let sql = `SELECT j.*, c.name as client_name, c.email as client_email, c.phone as client_phone
    FROM jobs j LEFT JOIN clients c ON j.client_id = c.id WHERE j.user_id = ?`;
  const params = [req.user.id];

  if (stage) { sql += ' AND j.stage = ?'; params.push(stage); }
  if (client_id) { sql += ' AND j.client_id = ?'; params.push(client_id); }
  sql += ' ORDER BY j.updated_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// Single job
router.get('/:id', (req, res) => {
  const job = getJobWithDetails(req.params.id);
  if (!job || job.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

// Update job
router.put('/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!job) return res.status(404).json({ error: 'Not found' });

  const { client_id, quote_id, title, description, stage, value, scheduled_date, completed_date, notes } = req.body;
  const fields = { client_id, quote_id, title, description, stage, value, scheduled_date, completed_date, notes };
  const updates = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) { updates.push(`${k} = ?`); vals.push(v); }
  }

  if (stage && stage !== job.stage) {
    if (stage === 'completed') {
      updates.push("completed_date = datetime('now')");
    }
    if (job.client_id) {
      addTimeline(job.client_id, req.user.id, 'note', `Job "${job.title}" moved to ${stage.replace('_', ' ')}`);
    }
  }

  if (updates.length) {
    updates.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  }

  res.json(getJobWithDetails(req.params.id));
});

// Delete job
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM jobs WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

function getJobWithDetails(id) {
  const job = db.prepare(`SELECT j.*, c.name as client_name, c.email as client_email, c.phone as client_phone
    FROM jobs j LEFT JOIN clients c ON j.client_id = c.id WHERE j.id = ?`).get(id);
  if (!job) return null;
  if (job.quote_id) {
    job.quote = db.prepare('SELECT id, client_name, total, status, created_at FROM quotes WHERE id = ?').get(job.quote_id);
  }
  return job;
}

export default router;
