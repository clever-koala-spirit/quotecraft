import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import OpenAI from 'openai';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';
import { readFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '..', 'uploads');
mkdirSync(uploadsDir, { recursive: true });

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = join(uploadsDir, 'temp');
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 10 } });

// Serve uploaded files
router.get('/uploads/:quoteId/:filename', authenticateToken, (req, res) => {
  const filePath = join(uploadsDir, req.params.quoteId, req.params.filename);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.sendFile(filePath);
});

// AI Generate with file uploads
router.post('/generate', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const { description } = req.body;
    const files = req.files || [];

    // Build messages for GPT-4o with vision
    const contentParts = [];

    contentParts.push({
      type: 'text',
      text: `You are an expert Australian trade quoting assistant. Analyze all provided information (images, documents, text) and generate a complete quote.

User description: ${description || 'No description provided'}

Based on ALL the information provided (images showing job scope, any documents/emails, and the text description), generate a structured quote.

Return ONLY valid JSON with this structure:
{
  "title": "Brief job title",
  "description": "Detailed job description based on all inputs",
  "lineItems": [
    { "description": "string", "quantity": number, "unit": "each|m|m²|hr|day|lot|kg|L", "unitPrice": number, "total": number, "category": "labour|materials" }
  ],
  "notes": "Any important notes, assumptions, or recommendations"
}

All prices in AUD ex-GST. Use realistic Australian trade pricing. Be specific with descriptions. Include both labour and materials items.`
    });

    // Process uploaded files
    for (const file of files) {
      const mime = file.mimetype;
      if (mime.startsWith('image/')) {
        const base64 = readFileSync(file.path).toString('base64');
        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${mime};base64,${base64}`, detail: 'high' }
        });
      } else if (mime === 'application/pdf') {
        try {
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(readFileSync(file.path));
          contentParts.push({
            type: 'text',
            text: `[Content from PDF "${file.originalname}"]:\n${pdfData.text.slice(0, 5000)}`
          });
        } catch (e) {
          console.error('PDF parse error:', e.message);
        }
      } else {
        // Try to read as text
        try {
          const text = readFileSync(file.path, 'utf-8').slice(0, 5000);
          contentParts.push({
            type: 'text',
            text: `[Content from "${file.originalname}"]:\n${text}`
          });
        } catch (e) { /* skip binary files */ }
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: contentParts }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse AI response' });
    const result = JSON.parse(jsonMatch[0]);

    const items = result.lineItems || [];
    const subtotal = items.reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
    const gst = Math.round(subtotal * 0.1 * 100) / 100;

    // Return temp file info so frontend can reference them
    const uploadedFiles = files.map(f => ({
      tempFilename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      isImage: f.mimetype.startsWith('image/')
    }));

    res.json({
      title: result.title || 'Untitled Job',
      description: result.description || description || '',
      items,
      notes: result.notes || '',
      subtotal: Math.round(subtotal * 100) / 100,
      gst,
      total: Math.round((subtotal + gst) * 100) / 100,
      uploadedFiles
    });
  } catch (e) {
    console.error('AI generation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Get next quote number
function getNextQuoteNumber(userId) {
  const profile = db.prepare('SELECT next_quote_number, quote_numbering_format FROM business_profiles WHERE user_id = ?').get(userId);
  if (!profile) return 'QC-0001';
  
  const number = profile.next_quote_number || 1;
  const format = profile.quote_numbering_format || 'QC-{number}';
  const paddedNumber = String(number).padStart(4, '0');
  
  // Update next number
  db.prepare('UPDATE business_profiles SET next_quote_number = ? WHERE user_id = ?').run(number + 1, userId);
  
  return format.replace('{number}', paddedNumber);
}

// Create quote
router.post('/', authenticateToken, (req, res) => {
  const id = uuid();
  const { client_name, client_email, client_phone, client_address, trade_type, job_description, items, notes, validity_days, template, tempFiles } = req.body;

  const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
  const subtotal = (items || []).reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
  const gstRate = profile?.gst_rate || 0.10;
  const gst = Math.round(subtotal * gstRate * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;
  const quoteNumber = getNextQuoteNumber(req.user.id);

  db.prepare(`INSERT INTO quotes (id, user_id, client_name, client_email, client_phone, client_address, trade_type, job_description, subtotal, gst, total, notes, validity_days, business_snapshot, template, status, quote_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`).run(
    id, req.user.id, client_name, client_email, client_phone, client_address, trade_type, job_description,
    Math.round(subtotal * 100) / 100, gst, total, notes, validity_days || 30, JSON.stringify(profile), template || 'clean-modern', quoteNumber
  );

  if (items?.length) {
    const stmt = db.prepare('INSERT INTO quote_items (id, quote_id, description, quantity, unit, unit_price, total, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    items.forEach((item, i) => {
      stmt.run(uuid(), id, item.description, item.quantity, item.unit, item.unitPrice, item.total || item.quantity * item.unitPrice, item.category, i);
    });
  }

  // Move temp files to quote directory
  if (tempFiles?.length) {
    const quoteDir = join(uploadsDir, id);
    mkdirSync(quoteDir, { recursive: true });
    const attachStmt = db.prepare('INSERT INTO quote_attachments (id, quote_id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)');
    for (const tf of tempFiles) {
      const tempPath = join(uploadsDir, 'temp', tf.tempFilename);
      if (existsSync(tempPath)) {
        copyFileSync(tempPath, join(quoteDir, tf.tempFilename));
        attachStmt.run(uuid(), id, tf.tempFilename, tf.originalName, tf.mimeType, tf.size);
      }
    }
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

  const { client_name, client_email, client_phone, client_address, trade_type, job_description, items, status, notes, template } = req.body;

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

  const fields = { client_name, client_email, client_phone, client_address, trade_type, job_description, status, notes, template };
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

// Send quote — auto-create client + timeline + email
router.post('/:id/send', authenticateToken, async (req, res) => {
  try {
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!quote) return res.status(404).json({ error: 'Not found' });

    const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);

    db.prepare("UPDATE quotes SET status = 'sent', sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(quote.id);
    addEvent(quote.id, 'sent', { to: quote.client_email });

    // Auto-create client if not exists
    let client = null;
    if (quote.client_email) {
      client = db.prepare('SELECT * FROM clients WHERE email = ? AND user_id = ?').get(quote.client_email, req.user.id);
    }
    if (!client && quote.client_name) {
      if (!quote.client_email) {
        client = db.prepare('SELECT * FROM clients WHERE name = ? AND user_id = ?').get(quote.client_name, req.user.id);
      }
      if (!client) {
        const clientId = uuid();
        db.prepare(`INSERT INTO clients (id, user_id, name, email, phone, address, tags) VALUES (?, ?, ?, ?, ?, ?, '[]')`).run(
          clientId, req.user.id, quote.client_name, quote.client_email || null, quote.client_phone || null, quote.client_address || null
        );
        client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
      }
    }

    // Log to client timeline
    if (client) {
      const tlId = uuid();
      db.prepare('INSERT INTO client_timeline (id, client_id, user_id, type, content, metadata) VALUES (?, ?, ?, ?, ?, ?)').run(
        tlId, client.id, req.user.id, 'quote_sent', `Quote sent: $${quote.total}`, JSON.stringify({ quote_id: quote.id, total: quote.total })
      );
    }

    // Send email if client has email and SMTP is configured
    const publicUrl = `https://api.slayseason.com/quotecraft/q/${quote.id}`;
    if (quote.client_email && process.env.SMTP_HOST) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        const businessName = profile?.business_name || 'QuoteCraft';
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
        await transporter.sendMail({
          from: `"${businessName}" <${fromEmail}>`,
          to: quote.client_email,
          subject: `Quote #${quote.quote_number} from ${businessName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">You've received a quote</h2>
              <p>Hi ${quote.client_name || 'there'},</p>
              <p><strong>${businessName}</strong> has sent you a quote for your review.</p>
              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Quote #${quote.quote_number}</strong></p>
                <p style="margin: 5px 0; color: #666;">${quote.job_description || ''}</p>
                <p style="margin: 10px 0; font-size: 24px; color: #1a1a1a;"><strong>$${Number(quote.total).toFixed(2)}</strong> <span style="font-size: 14px; color: #666;">inc GST</span></p>
              </div>
              <a href="${publicUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View & Accept Quote</a>
              <p style="margin-top: 20px; color: #666; font-size: 14px;">This quote is valid for ${quote.validity_days || 30} days.</p>
            </div>
          `
        });
        console.log(`📧 Email sent to ${quote.client_email}`);
      } catch (emailErr) {
        console.log(`⚠️ Email failed (quote still marked sent): ${emailErr.message}`);
      }
    }

    console.log(`📧 Quote ${quote.id} sent to ${quote.client_email || 'no email'}`);
    res.json({ success: true, publicUrl });
  } catch (err) {
    console.error('Send quote error:', err);
    res.status(500).json({ error: 'Failed to send quote' });
  }
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
    // Timeline entry
    if (quote.client_email) {
      const client = db.prepare('SELECT id FROM clients WHERE email = ?').get(quote.client_email);
      if (client) {
        db.prepare('INSERT INTO client_timeline (id, client_id, user_id, type, content, metadata) VALUES (?, ?, ?, ?, ?, ?)').run(
          uuid(), client.id, quote.user_id, 'quote_viewed', 'Quote viewed by client', JSON.stringify({ quote_id: quote.id })
        );
      }
    }
  }
  res.json(quote);
});

// Accept quote (public)
router.post('/:id/accept', (req, res) => {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Not found' });

  const action = req.body.action || 'accept';
  const eventType = action === 'decline' ? 'declined' : 'accepted';

  if (action === 'decline') {
    db.prepare("UPDATE quotes SET status = 'declined', declined_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(quote.id);
  } else {
    db.prepare("UPDATE quotes SET status = 'accepted', accepted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(quote.id);
  }
  addEvent(quote.id, eventType);

  // Timeline entry
  if (quote.client_email) {
    const client = db.prepare('SELECT id FROM clients WHERE email = ?').get(quote.client_email);
    if (client) {
      db.prepare('INSERT INTO client_timeline (id, client_id, user_id, type, content, metadata) VALUES (?, ?, ?, ?, ?, ?)').run(
        uuid(), client.id, quote.user_id, `quote_${eventType}`, `Quote ${eventType}: $${quote.total}`, JSON.stringify({ quote_id: quote.id })
      );
      // Auto-create job on accept
      if (eventType === 'accepted') {
        db.prepare(`INSERT INTO jobs (id, user_id, client_id, quote_id, title, description, stage, value) VALUES (?, ?, ?, ?, ?, ?, 'accepted', ?)`).run(
          uuid(), quote.user_id, client.id, quote.id, quote.job_description || 'Job from quote', quote.job_description, quote.total
        );
      }
    }
  }
  res.json({ success: true });
});

// PDF with templates
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  const { default: PDFDocument } = await import('pdfkit');
  const quote = getQuoteWithItems(req.params.id);
  if (!quote || quote.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' });

  const template = req.query.template || quote.template || 'clean-modern';
  const profile = quote.business_snapshot ? JSON.parse(quote.business_snapshot) : {};
  const attachments = db.prepare('SELECT * FROM quote_attachments WHERE quote_id = ?').all(quote.id);
  const imageAttachments = attachments.filter(a => a.mime_type?.startsWith('image/'));

  const templates = getTemplateConfig(template);
  const doc = new PDFDocument({ size: 'A4', margin: templates.margin });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Quote-${quote.id.slice(0, 8)}.pdf`);
  doc.pipe(res);

  const m = templates.margin;
  const pw = 595.28 - m * 2; // page width minus margins

  // --- HEADER ---
  if (templates.headerBg) {
    doc.rect(0, 0, 595.28, templates.headerHeight).fill(templates.headerBg);
  }

  doc.fontSize(templates.titleSize).font('Helvetica-Bold').fillColor(templates.titleColor);
  doc.text(profile.business_name || 'QuoteCraft', m, m);

  doc.fontSize(9).font('Helvetica').fillColor(templates.dimColor);
  let y = m + templates.titleSize + 8;
  if (profile.abn) { doc.text(`ABN: ${profile.abn}`, m, y); y += 13; }
  if (profile.licence_number) { doc.text(`Licence: ${profile.licence_number}`, m, y); y += 13; }
  if (profile.phone) { doc.text(`Ph: ${profile.phone}`, m, y); y += 13; }
  if (profile.email) { doc.text(profile.email, m, y); y += 13; }
  if (profile.address) { doc.text(profile.address, m, y); y += 13; }

  // Quote title bar
  y += 15;
  if (templates.accentBg) {
    doc.rect(m, y, pw, 30).fill(templates.accentBg);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#fff');
    doc.text('QUOTE', m + 10, y + 8);
    doc.fontSize(9).font('Helvetica');
    doc.text(`#${quote.id.slice(0, 8).toUpperCase()}`, m + 80, y + 10);
    doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString('en-AU')}`, pw - 100, y + 10);
    y += 40;
  } else {
    doc.fontSize(16).font('Helvetica-Bold').fillColor(templates.textColor).text('QUOTE', m, y);
    y += 22;
    doc.fontSize(9).font('Helvetica').fillColor(templates.dimColor);
    doc.text(`Quote #: ${quote.id.slice(0, 8).toUpperCase()}`, m, y);
    doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString('en-AU')}`, 300, y);
    y += 13;
    doc.text(`Valid for: ${quote.validity_days} days`, m, y);
    y += 20;
  }

  // Client
  doc.font('Helvetica-Bold').fontSize(10).fillColor(templates.textColor).text('Client:', m, y); y += 14;
  doc.font('Helvetica').fontSize(9).fillColor(templates.dimColor);
  if (quote.client_name) { doc.text(quote.client_name, m, y); y += 13; }
  if (quote.client_email) { doc.text(quote.client_email, m, y); y += 13; }
  if (quote.client_phone) { doc.text(quote.client_phone, m, y); y += 13; }
  if (quote.client_address) { doc.text(quote.client_address, m, y); y += 13; }

  // Job description
  if (quote.job_description) {
    y += 8;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(templates.textColor).text('Job Description:', m, y); y += 14;
    doc.font('Helvetica').fontSize(9).fillColor(templates.dimColor).text(quote.job_description, m, y, { width: pw });
    y = doc.y + 15;
  }

  // Job photos in PDF
  if (imageAttachments.length > 0 && (template === 'photo-gallery' || template !== 'compact')) {
    const photoSize = template === 'photo-gallery' ? 150 : 80;
    const cols = Math.floor(pw / (photoSize + 10));
    let col = 0;
    const startY = y;

    for (const att of imageAttachments) {
      const imgPath = join(uploadsDir, quote.id, att.filename);
      if (!existsSync(imgPath)) continue;
      try {
        if (y > 700) { doc.addPage(); y = m; col = 0; }
        const x = m + col * (photoSize + 10);
        doc.image(imgPath, x, y, { width: photoSize, height: photoSize, fit: [photoSize, photoSize] });
        col++;
        if (col >= cols) { col = 0; y += photoSize + 10; }
      } catch (e) { console.error('Image embed error:', e.message); }
    }
    if (col > 0) y += photoSize + 10;
    y += 5;
  }

  // Table header
  if (y > 620) { doc.addPage(); y = m; }
  const cols = [m, m + 230, m + 270, m + 330, m + 390, m + pw];
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff');
  doc.rect(m, y, pw, 18).fill(templates.tableHeaderBg);
  doc.fillColor('#fff');
  doc.text('Description', cols[0] + 5, y + 5, { width: 220 });
  doc.text('Qty', cols[1] + 5, y + 5, { width: 35 });
  doc.text('Unit', cols[2] + 5, y + 5, { width: 55 });
  doc.text('Rate', cols[3] + 5, y + 5, { width: 55 });
  doc.text('Total', cols[4] + 5, y + 5, { width: 55 });
  y += 18;

  // Items
  doc.font('Helvetica').fontSize(8).fillColor(templates.textColor);
  (quote.items || []).forEach((item, i) => {
    if (y > 720) { doc.addPage(); y = m; }
    const bg = i % 2 === 0 ? templates.rowEven : templates.rowOdd;
    doc.rect(m, y, pw, 16).fill(bg);
    doc.fillColor(templates.textColor);
    doc.text(item.description, cols[0] + 5, y + 4, { width: 220 });
    doc.text(String(item.quantity), cols[1] + 5, y + 4, { width: 35 });
    doc.text(item.unit, cols[2] + 5, y + 4, { width: 55 });
    doc.text(`$${Number(item.unit_price).toFixed(2)}`, cols[3] + 5, y + 4, { width: 55 });
    doc.text(`$${Number(item.total).toFixed(2)}`, cols[4] + 5, y + 4, { width: 55 });
    y += 16;
  });

  // Totals
  y += 10;
  doc.font('Helvetica').fontSize(10).fillColor(templates.textColor);
  doc.text('Subtotal (ex GST):', 380, y); doc.text(`$${Number(quote.subtotal).toFixed(2)}`, 480, y, { align: 'right', width: 65 }); y += 16;
  doc.text('GST (10%):', 380, y); doc.text(`$${Number(quote.gst).toFixed(2)}`, 480, y, { align: 'right', width: 65 }); y += 16;
  doc.font('Helvetica-Bold').fontSize(12).fillColor(templates.accentColor || templates.textColor);
  doc.text('Total (inc GST):', 380, y); doc.text(`$${Number(quote.total).toFixed(2)}`, 480, y, { align: 'right', width: 65 }); y += 25;

  // Notes
  if (quote.notes) {
    if (y > 680) { doc.addPage(); y = m; }
    doc.font('Helvetica-Bold').fontSize(9).fillColor(templates.textColor).text('Notes:', m, y); y += 13;
    doc.font('Helvetica').fontSize(8).fillColor(templates.dimColor).text(quote.notes, m, y, { width: pw }); y = doc.y + 15;
  }

  // Payment terms
  if (profile.payment_terms) {
    if (y > 700) { doc.addPage(); y = m; }
    doc.font('Helvetica-Bold').fontSize(9).fillColor(templates.textColor).text('Payment Terms:', m, y); y += 13;
    doc.font('Helvetica').fontSize(8).fillColor(templates.dimColor).text(profile.payment_terms, m, y, { width: pw }); y = doc.y + 15;
  }

  // Footer
  doc.fontSize(7).fillColor(templates.dimColor).text('Generated by QuoteCraft — quotecraft.com.au', m, 780, { align: 'center', width: pw });

  doc.end();
});

function getTemplateConfig(template) {
  const base = { margin: 50, titleSize: 22, headerHeight: 120, textColor: '#333', dimColor: '#666', rowEven: '#f9f9f9', rowOdd: '#fff', tableHeaderBg: '#333', titleColor: '#000', headerBg: null, accentBg: null, accentColor: null };

  const configs = {
    'clean-modern': { ...base },
    'professional-blue': { ...base, titleColor: '#1a4b8c', accentBg: '#1a4b8c', accentColor: '#1a4b8c', tableHeaderBg: '#1a4b8c', dimColor: '#555' },
    'trade-bold': { ...base, titleSize: 26, titleColor: '#222', accentBg: '#f97316', accentColor: '#f97316', tableHeaderBg: '#f97316' },
    'minimal': { ...base, margin: 60, titleSize: 18, headerHeight: 90 },
    'detailed': { ...base, titleColor: '#2d3748', accentBg: '#2d3748', tableHeaderBg: '#2d3748' },
    'premium': { ...base, titleColor: '#1a1a2e', accentBg: '#b8860b', accentColor: '#b8860b', tableHeaderBg: '#1a1a2e', rowEven: '#faf8f0', dimColor: '#555' },
    'compact': { ...base, margin: 35, titleSize: 16, headerHeight: 80 },
    'photo-gallery': { ...base, accentBg: '#2d5016', accentColor: '#2d5016', tableHeaderBg: '#2d5016' },
    'itemised': { ...base, accentBg: '#4a1d96', accentColor: '#4a1d96', tableHeaderBg: '#4a1d96' },
    'custom': { ...base, accentBg: '#f97316', accentColor: '#f97316', tableHeaderBg: '#f97316' },
  };

  return configs[template] || configs['clean-modern'];
}

function getQuoteWithItems(id) {
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
  if (!quote) return null;
  quote.items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order').all(id);
  quote.events = db.prepare('SELECT * FROM quote_events WHERE quote_id = ? ORDER BY created_at DESC').all(id);
  quote.attachments = db.prepare('SELECT * FROM quote_attachments WHERE quote_id = ?').all(id);
  return quote;
}

function addEvent(quoteId, type, metadata = {}) {
  db.prepare('INSERT INTO quote_events (id, quote_id, event_type, metadata) VALUES (?, ?, ?, ?)').run(uuid(), quoteId, type, JSON.stringify(metadata));
}

export default router;
