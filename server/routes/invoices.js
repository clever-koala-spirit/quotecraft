import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();
router.use(authenticateToken);

// Get next invoice number
function getNextInvoiceNumber(userId) {
  const profile = db.prepare('SELECT next_invoice_number, invoice_numbering_format FROM business_profiles WHERE user_id = ?').get(userId);
  if (!profile) return 'INV-0001';
  
  const number = profile.next_invoice_number || 1;
  const format = profile.invoice_numbering_format || 'INV-{number}';
  const paddedNumber = String(number).padStart(4, '0');
  
  // Update next number
  db.prepare('UPDATE business_profiles SET next_invoice_number = ? WHERE user_id = ?').run(number + 1, userId);
  
  return format.replace('{number}', paddedNumber);
}

// Create invoice from quote
router.post('/from-quote/:quoteId', (req, res) => {
  try {
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND user_id = ?').get(req.params.quoteId, req.user.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    const quoteItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order').all(quote.id);
    const invoiceId = uuid();
    const invoiceNumber = getNextInvoiceNumber(req.user.id);
    
    const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
    const defaultPaymentTerms = profile?.default_payment_terms || '30 days';
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (parseInt(defaultPaymentTerms) || 30));
    
    // Create invoice
    db.prepare(`INSERT INTO invoices (id, user_id, quote_id, client_name, client_email, client_phone, client_address, 
      invoice_number, job_description, subtotal, gst, total, due_date, notes, business_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      invoiceId, req.user.id, quote.id, quote.client_name, quote.client_email, quote.client_phone, 
      quote.client_address, invoiceNumber, quote.job_description, quote.subtotal, quote.gst, 
      quote.total, dueDate.toISOString().split('T')[0], quote.notes, quote.business_snapshot
    );
    
    // Copy line items
    for (const item of quoteItems) {
      db.prepare(`INSERT INTO invoice_items (id, invoice_id, description, quantity, unit, unit_price, total, category, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        uuid(), invoiceId, item.description, item.quantity, item.unit, item.unit_price, 
        item.total, item.category, item.sort_order
      );
    }
    
    // Update quote status
    db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run('converted', quote.id);
    
    // Log event
    db.prepare('INSERT INTO invoice_events (id, invoice_id, event_type, metadata) VALUES (?, ?, ?, ?)').run(
      uuid(), invoiceId, 'created', JSON.stringify({ from_quote: quote.id })
    );
    
    res.json(getInvoiceWithDetails(invoiceId));
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Create invoice manually
router.post('/', (req, res) => {
  try {
    const { client_name, client_email, client_phone, client_address, job_description, items, notes, due_date } = req.body;
    if (!client_name || !items || items.length === 0) {
      return res.status(400).json({ error: 'Client name and items are required' });
    }
    
    const invoiceId = uuid();
    const invoiceNumber = getNextInvoiceNumber(req.user.id);
    const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
    const subtotal = items.reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
    const gstRate = profile?.gst_rate || 0.10;
    const gst = Math.round(subtotal * gstRate * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;
    
    // Create invoice
    db.prepare(`INSERT INTO invoices (id, user_id, client_name, client_email, client_phone, client_address, 
      invoice_number, job_description, subtotal, gst, total, due_date, notes, business_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      invoiceId, req.user.id, client_name, client_email, client_phone, client_address, invoiceNumber, 
      job_description, subtotal, gst, total, due_date, notes, JSON.stringify(profile)
    );
    
    // Add line items
    items.forEach((item, index) => {
      db.prepare(`INSERT INTO invoice_items (id, invoice_id, description, quantity, unit, unit_price, total, category, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        uuid(), invoiceId, item.description, item.quantity || 1, item.unit || 'each', 
        item.unitPrice || 0, item.total || (item.quantity * item.unitPrice), 
        item.category || 'labour', index
      );
    });
    
    // Log event
    db.prepare('INSERT INTO invoice_events (id, invoice_id, event_type) VALUES (?, ?, ?)').run(
      uuid(), invoiceId, 'created'
    );
    
    res.json(getInvoiceWithDetails(invoiceId));
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// List invoices
router.get('/', (req, res) => {
  const { status, client_name, limit = 50 } = req.query;
  let sql = 'SELECT * FROM invoices WHERE user_id = ?';
  const params = [req.user.id];
  
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (client_name) { sql += ' AND client_name LIKE ?'; params.push(`%${client_name}%`); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  const invoices = db.prepare(sql).all(...params);
  res.json(invoices);
});

// Single invoice
router.get('/:id', (req, res) => {
  const invoice = getInvoiceWithDetails(req.params.id);
  if (!invoice || invoice.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json(invoice);
});

// Update invoice
router.put('/:id', (req, res) => {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    const { client_name, client_email, client_phone, client_address, job_description, items, notes, due_date, status } = req.body;
    
    // Update invoice
    db.prepare(`UPDATE invoices SET client_name = ?, client_email = ?, client_phone = ?, client_address = ?, 
      job_description = ?, notes = ?, due_date = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?`).run(
      client_name, client_email, client_phone, client_address, job_description, notes, due_date, status, req.params.id
    );
    
    // Update line items if provided
    if (items) {
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(req.params.id);
      
      const subtotal = items.reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
      const profile = db.prepare('SELECT gst_rate FROM business_profiles WHERE user_id = ?').get(req.user.id);
      const gstRate = profile?.gst_rate || 0.10;
      const gst = Math.round(subtotal * gstRate * 100) / 100;
      const total = Math.round((subtotal + gst) * 100) / 100;
      
      db.prepare('UPDATE invoices SET subtotal = ?, gst = ?, total = ? WHERE id = ?').run(subtotal, gst, total, req.params.id);
      
      items.forEach((item, index) => {
        db.prepare(`INSERT INTO invoice_items (id, invoice_id, description, quantity, unit, unit_price, total, category, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          uuid(), req.params.id, item.description, item.quantity || 1, item.unit || 'each',
          item.unitPrice || 0, item.total || (item.quantity * item.unitPrice), 
          item.category || 'labour', index
        );
      });
    }
    
    res.json(getInvoiceWithDetails(req.params.id));
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Send invoice
router.post('/:id/send', (req, res) => {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    db.prepare('UPDATE invoices SET status = ?, sent_at = datetime(\'now\') WHERE id = ?').run('sent', req.params.id);
    
    // Log event
    db.prepare('INSERT INTO invoice_events (id, invoice_id, event_type) VALUES (?, ?, ?)').run(
      uuid(), req.params.id, 'sent'
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Send invoice error:', err);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// Record payment
router.post('/:id/payment', (req, res) => {
  try {
    const { amount, method, reference, date } = req.body;
    if (!amount) return res.status(400).json({ error: 'Payment amount is required' });
    
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    const paidAmount = (invoice.payment_amount || 0) + amount;
    const status = paidAmount >= invoice.total ? 'paid' : 'partial';
    
    db.prepare(`UPDATE invoices SET payment_amount = ?, payment_method = ?, payment_reference = ?, 
      status = ?, paid_at = CASE WHEN ? >= total THEN datetime('now') ELSE paid_at END
      WHERE id = ?`).run(paidAmount, method, reference, status, paidAmount, req.params.id);
    
    // Log payment event
    db.prepare('INSERT INTO invoice_events (id, invoice_id, event_type, metadata) VALUES (?, ?, ?, ?)').run(
      uuid(), req.params.id, 'payment', JSON.stringify({ amount, method, reference, date })
    );
    
    res.json(getInvoiceWithDetails(req.params.id));
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Delete invoice
router.delete('/:id', (req, res) => {
  try {
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Helper function to get invoice with details
function getInvoiceWithDetails(invoiceId) {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
  if (!invoice) return null;
  
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order').all(invoiceId);
  const events = db.prepare('SELECT * FROM invoice_events WHERE invoice_id = ? ORDER BY created_at DESC').all(invoiceId);
  
  return { ...invoice, items, events };
}

export default router;