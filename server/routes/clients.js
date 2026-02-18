import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();
router.use(authenticateToken);

// Create client
router.post('/', (req, res) => {
  const id = uuid();
  const { name, email, phone, address, company, tags, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  db.prepare(`INSERT INTO clients (id, user_id, name, email, phone, address, company, tags, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, req.user.id, name, email || null, phone || null, address || null,
    company || null, JSON.stringify(tags || []), notes || null
  );

  addTimeline(id, req.user.id, 'note', 'Client created');
  res.json(db.prepare('SELECT * FROM clients WHERE id = ?').get(id));
});

// List clients
router.get('/', (req, res) => {
  const { search, tag } = req.query;
  let sql = 'SELECT c.*, (SELECT COUNT(*) FROM quotes q WHERE q.client_email = c.email AND q.user_id = c.user_id) as quote_count, (SELECT MAX(ct.created_at) FROM client_timeline ct WHERE ct.client_id = c.id) as last_contact FROM clients c WHERE c.user_id = ?';
  const params = [req.user.id];

  if (search) {
    sql += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.company LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (tag) {
    sql += ' AND c.tags LIKE ?';
    params.push(`%"${tag}"%`);
  }
  sql += ' ORDER BY c.updated_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// Single client with timeline
router.get('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!client) return res.status(404).json({ error: 'Not found' });

  client.timeline = db.prepare('SELECT * FROM client_timeline WHERE client_id = ? ORDER BY created_at DESC LIMIT 50').all(client.id);
  client.quotes = db.prepare('SELECT * FROM quotes WHERE client_email = ? AND user_id = ? ORDER BY created_at DESC').all(client.email, req.user.id);
  client.jobs = db.prepare('SELECT * FROM jobs WHERE client_id = ? ORDER BY created_at DESC').all(client.id);
  client.followups = db.prepare('SELECT * FROM followups WHERE client_id = ? ORDER BY due_date ASC').all(client.id);
  res.json(client);
});

// Update client
router.put('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!client) return res.status(404).json({ error: 'Not found' });

  const { name, email, phone, address, company, tags, notes } = req.body;
  const fields = { name, email, phone, address, company, notes };
  const updates = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) { updates.push(`${k} = ?`); vals.push(v); }
  }
  if (tags !== undefined) { updates.push('tags = ?'); vals.push(JSON.stringify(tags)); }
  if (updates.length) {
    updates.push("updated_at = datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  }
  res.json(db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id));
});

// Delete client
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM client_timeline WHERE client_id = ?').run(req.params.id);
  res.json({ success: true });
});

// Add note to timeline
router.post('/:id/notes', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!client) return res.status(404).json({ error: 'Not found' });

  const { content, type } = req.body;
  const id = addTimeline(client.id, req.user.id, type || 'note', content);
  db.prepare("UPDATE clients SET updated_at = datetime('now') WHERE id = ?").run(client.id);
  res.json(db.prepare('SELECT * FROM client_timeline WHERE id = ?').get(id));
});

// Get timeline
router.get('/:id/timeline', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!client) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM client_timeline WHERE client_id = ? ORDER BY created_at DESC').all(client.id));
});

// CSV import
router.post('/import', (req, res) => {
  const { clients } = req.body;
  if (!Array.isArray(clients)) return res.status(400).json({ error: 'Expected clients array' });

  let imported = 0;
  const stmt = db.prepare(`INSERT INTO clients (id, user_id, name, email, phone, address, company, tags, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  for (const c of clients) {
    if (!c.name) continue;
    // Check duplicate by email
    if (c.email) {
      const existing = db.prepare('SELECT id FROM clients WHERE email = ? AND user_id = ?').get(c.email, req.user.id);
      if (existing) continue;
    }
    stmt.run(uuid(), req.user.id, c.name, c.email || null, c.phone || null, c.address || null, c.company || null, '[]', null);
    imported++;
  }
  res.json({ imported });
});

function addTimeline(clientId, userId, type, content, metadata = {}) {
  const id = uuid();
  db.prepare('INSERT INTO client_timeline (id, client_id, user_id, type, content, metadata) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, clientId, userId, type, content, JSON.stringify(metadata)
  );
  return id;
}

export { addTimeline };
export default router;
