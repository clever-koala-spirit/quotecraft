import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI Generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { tradeType, jobDescription, photos, clientName } = req.body;
    const messages = [
      {
        role: 'system',
        content: `You are an expert Australian trade quoting assistant. Generate detailed line items for a ${tradeType || 'general'} job quote.
Return ONLY valid JSON array of line items. Each item: { "description": string, "quantity": number, "unit": string, "unitPrice": number, "total": number, "category": "labour"|"materials" }
All prices in AUD, ex-GST. Use realistic Australian trade pricing. Be specific with descriptions.
Units can be: "each", "m", "m²", "hr", "day", "lot", "kg", "L".`
      },
      {
        role: 'user',
        content: `Generate quote line items for this job:\nTrade: ${tradeType}\nDescription: ${jobDescription}\nClient: ${clientName || 'Not specified'}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 2000,
    });

    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse AI response' });
    const items = JSON.parse(jsonMatch[0]);
    const subtotal = items.reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
    const gst = Math.round(subtotal * 0.1 * 100) / 100;

    res.json({ items, subtotal: Math.round(subtotal * 100) / 100, gst, total: Math.round((subtotal + gst) * 100) / 100 });
  } catch (e) {
    console.error('AI generation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Create quote
router.post('/', authenticateToken, (req, res) => {
  const id = uuid();
  const { client_name, client_email, client_phone, client_address, trade_type, job_description, items, notes, validity_days } = req.body;
  
  const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
  const subtotal = (items || []).reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
  const gst = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  db.prepare(`INSERT INTO quotes (id, user_id, client_name, client_email, client_phone, client_address, trade_type, job_description, subtotal, gst, total, notes, validity_days, business_snapshot, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`).run(
    id, req.user.id, client_name, client_email, client_phone, client_address, trade_type, job_description,
    Math.round(subtotal * 100) / 100, gst, total, notes, validity_days || 30, JSON.stringify(profile)
  );

  if (items?.length) {
    const stmt = db.prepare('INSERT INTO quote_items (id, quote_id, description, quantity, unit, unit_price, total, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    items.forEach((item, i) => {
      stmt.run(uuid(), id, item.description, item.quantity, item.unit, item.unitPrice, item.total || item.quantity * item.unitPrice, item.category, i);
    });
  }

  addEvent(id, 'created');
  const quote = getQuoteWithItems(id);
  res.json(quote);
});

// List quotes
router.get('/', authenticateToken, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM quotes WHERE user_id = ?';
  const params = [req.user.id];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  const quotes = db.prepare(sql).all(...params);
  res.json(quotes);
});

// Single quote
router.get('/:id', authenticateToken, (req, res) => {
  const quote = getQuoteWithItems(req.params.id);
  if (!quote || quote.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' });
  res.json(quote);
});

// Update quote
router.put('/:id', authenticateToken, (req, res) => {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!quote) return res.status(404).json({ error: 'Not found' });

  const { client_name, client_email, client_phone, client_address, trade_type, job_description, items, status, notes } = req.body;
  
  if (items) {
    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run(quote.id);
    const stmt = db.prepare('INSERT INTO quote_items (id, quote_id, description, quantity, unit, unit_price, total, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    items.forEach((item, i) => {
      stmt.run(uuid(), quote.id, item.description, item.quantity, item.unit, item.unitPrice, item.total || item.quantity * item.unitPrice, item.category, i);
    });
    const subtotal = items.reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
    const gst = Math.round(subtotal * 0.1 * 100) / 100;
    db.prepare("UPDATE quotes SET subtotal = ?, gst = ?, total = ?, updated_at = datetime('now') WHERE id = ?").run(
      Math.round(subtotal * 100) / 100, gst, Math.round((subtotal + gst) * 100) / 100, quote.id
    );
  }

  const fields = { client_name, client_email, client_phone, client_address, trade_type, job_description, status, notes };
  const updates = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) { updates.push(`${k} = ?`); vals.push(v); }
  }
  if (updates.length) {
    updates.push("updated_at = datetime('now')");
    vals.push(quote.id);
    db.prepare(`UPDATE quotes SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  }

  if (status) addEvent(quote.id, `status_${status}`);
  res.json(getQuoteWithItems(quote.id));
});

// Delete quote
router.delete('/:id', authenticateToken, (req, res) => {
  const result = db.prepare('DELETE FROM quotes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Send quote
router.post('/:id/send', authenticateToken, (req, res) => {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!quote) return res.status(404).json({ error: 'Not found' });
  
  db.prepare("UPDATE quotes SET status = 'sent', sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(quote.id);
  addEvent(quote.id, 'sent', { to: quote.client_email });
  
  // Log email (would use nodemailer in production)
  console.log(`📧 Quote ${quote.id} sent to ${quote.client_email}`);
  console.log(`   Public link: /q/${quote.id}`);
  
  res.json({ success: true, publicUrl: `/q/${quote.id}` });
});

// Public view
router.get('/:id/view', (req, res) => {
  const quote = getQuoteWithItems(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Not found' });
  
  if (!quote.viewed_at) {
    db.prepare("UPDATE quotes SET viewed_at = datetime('now') WHERE id = ?").run(quote.id);
    if (quote.status === 'sent') {
      db.prepare("UPDATE quotes SET status = 'viewed' WHERE id = ?").run(quote.id);
    }
    addEvent(quote.id, 'viewed');
  }
  res.json(quote);
});

// Accept quote (public)
router.post('/:id/accept', (req, res) => {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Not found' });
  
  const action = req.body.action || 'accept';
  if (action === 'decline') {
    db.prepare("UPDATE quotes SET status = 'declined', declined_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(quote.id);
    addEvent(quote.id, 'declined');
  } else {
    db.prepare("UPDATE quotes SET status = 'accepted', accepted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(quote.id);
    addEvent(quote.id, 'accepted');
  }
  res.json({ success: true });
});

// PDF
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  const { default: PDFDocument } = await import('pdfkit');
  const quote = getQuoteWithItems(req.params.id);
  if (!quote || quote.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' });

  const profile = quote.business_snapshot ? JSON.parse(quote.business_snapshot) : {};
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Quote-${quote.id.slice(0, 8)}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text(profile.business_name || 'QuoteCraft', 50, 50);
  doc.fontSize(10).font('Helvetica').fillColor('#666');
  let y = 80;
  if (profile.abn) { doc.text(`ABN: ${profile.abn}`, 50, y); y += 15; }
  if (profile.licence_number) { doc.text(`Licence: ${profile.licence_number}`, 50, y); y += 15; }
  if (profile.phone) { doc.text(`Ph: ${profile.phone}`, 50, y); y += 15; }
  if (profile.email) { doc.text(profile.email, 50, y); y += 15; }
  if (profile.address) { doc.text(profile.address, 50, y); y += 15; }

  // Quote title
  y += 20;
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#000').text('QUOTE', 50, y);
  y += 25;
  doc.fontSize(10).font('Helvetica').fillColor('#333');
  doc.text(`Quote #: ${quote.id.slice(0, 8).toUpperCase()}`, 50, y);
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString('en-AU')}`, 300, y);
  y += 15;
  doc.text(`Valid for: ${quote.validity_days} days`, 50, y);
  
  // Client
  y += 30;
  doc.font('Helvetica-Bold').text('Client:', 50, y); y += 15;
  doc.font('Helvetica');
  if (quote.client_name) { doc.text(quote.client_name, 50, y); y += 15; }
  if (quote.client_email) { doc.text(quote.client_email, 50, y); y += 15; }
  if (quote.client_phone) { doc.text(quote.client_phone, 50, y); y += 15; }
  if (quote.client_address) { doc.text(quote.client_address, 50, y); y += 15; }

  // Job description
  if (quote.job_description) {
    y += 10;
    doc.font('Helvetica-Bold').text('Job Description:', 50, y); y += 15;
    doc.font('Helvetica').text(quote.job_description, 50, y, { width: 495 });
    y = doc.y + 20;
  }

  // Table header
  const cols = [50, 280, 320, 380, 440, 500];
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
  doc.rect(50, y, 495, 20).fill('#333');
  doc.fillColor('#fff');
  doc.text('Description', cols[0] + 5, y + 5, { width: 225 });
  doc.text('Qty', cols[1] + 5, y + 5, { width: 35 });
  doc.text('Unit', cols[2] + 5, y + 5, { width: 55 });
  doc.text('Rate', cols[3] + 5, y + 5, { width: 55 });
  doc.text('Total', cols[4] + 5, y + 5, { width: 55 });
  y += 20;

  // Items
  doc.font('Helvetica').fontSize(9).fillColor('#333');
  (quote.items || []).forEach((item, i) => {
    if (y > 720) { doc.addPage(); y = 50; }
    const bg = i % 2 === 0 ? '#f9f9f9' : '#fff';
    doc.rect(50, y, 495, 18).fill(bg);
    doc.fillColor('#333');
    doc.text(item.description, cols[0] + 5, y + 4, { width: 225 });
    doc.text(String(item.quantity), cols[1] + 5, y + 4, { width: 35 });
    doc.text(item.unit, cols[2] + 5, y + 4, { width: 55 });
    doc.text(`$${Number(item.unit_price).toFixed(2)}`, cols[3] + 5, y + 4, { width: 55 });
    doc.text(`$${Number(item.total).toFixed(2)}`, cols[4] + 5, y + 4, { width: 55 });
    y += 18;
  });

  // Totals
  y += 10;
  doc.font('Helvetica').fontSize(10);
  doc.text('Subtotal (ex GST):', 380, y); doc.text(`$${Number(quote.subtotal).toFixed(2)}`, 480, y, { align: 'right', width: 65 }); y += 18;
  doc.text('GST (10%):', 380, y); doc.text(`$${Number(quote.gst).toFixed(2)}`, 480, y, { align: 'right', width: 65 }); y += 18;
  doc.font('Helvetica-Bold').fontSize(12);
  doc.text('Total (inc GST):', 380, y); doc.text(`$${Number(quote.total).toFixed(2)}`, 480, y, { align: 'right', width: 65 }); y += 30;

  // Payment terms
  if (profile.payment_terms) {
    doc.font('Helvetica-Bold').fontSize(10).text('Payment Terms:', 50, y); y += 15;
    doc.font('Helvetica').fontSize(9).text(profile.payment_terms, 50, y, { width: 495 }); y += 30;
  }

  // Footer
  doc.fontSize(8).fillColor('#999').text('Generated by QuoteCraft — quotecraft.com.au', 50, 780, { align: 'center', width: 495 });

  doc.end();
});

function getQuoteWithItems(id) {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
  if (!quote) return null;
  quote.items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order').all(id);
  quote.events = db.prepare('SELECT * FROM quote_events WHERE quote_id = ? ORDER BY created_at DESC').all(id);
  return quote;
}

function addEvent(quoteId, type, metadata = {}) {
  db.prepare('INSERT INTO quote_events (id, quote_id, event_type, metadata) VALUES (?, ?, ?, ?)').run(uuid(), quoteId, type, JSON.stringify(metadata));
}

export default router;
