import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();
router.use(authenticateToken);

// Dashboard overview
router.get('/dashboard', (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'quarter', 'year'
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek.toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        return res.status(400).json({ error: 'Invalid period' });
    }
    
    // Quote metrics
    const quoteStats = db.prepare(`
      SELECT 
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_quotes,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotes,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_quotes,
        SUM(total) as total_quoted_value,
        AVG(total) as avg_quote_value
      FROM quotes 
      WHERE user_id = ? AND DATE(created_at) >= ?
    `).get(req.user.id, startDate);
    
    // Invoice metrics
    const invoiceStats = db.prepare(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_invoices,
        SUM(total) as total_invoiced,
        SUM(payment_amount) as total_payments,
        AVG(total) as avg_invoice_value
      FROM invoices 
      WHERE user_id = ? AND DATE(created_at) >= ?
    `).get(req.user.id, startDate);
    
    // Job pipeline
    const pipelineStats = db.prepare(`
      SELECT 
        stage,
        COUNT(*) as count,
        SUM(value) as total_value
      FROM jobs 
      WHERE user_id = ? AND DATE(created_at) >= ?
      GROUP BY stage
    `).all(req.user.id, startDate);
    
    // Client activity
    const clientStats = db.prepare(`
      SELECT COUNT(DISTINCT client_name) as active_clients
      FROM quotes 
      WHERE user_id = ? AND DATE(created_at) >= ?
    `).get(req.user.id, startDate);
    
    // Calculate conversion rate
    const conversionRate = quoteStats.sent_quotes > 0 
      ? Math.round((quoteStats.accepted_quotes / quoteStats.sent_quotes) * 100) 
      : 0;
    
    res.json({
      period,
      quotes: {
        ...quoteStats,
        conversion_rate: conversionRate
      },
      invoices: invoiceStats,
      pipeline: pipelineStats,
      clients: clientStats
    });
  } catch (err) {
    console.error('Dashboard report error:', err);
    res.status(500).json({ error: 'Failed to generate dashboard report' });
  }
});

// Revenue report
router.get('/revenue', (req, res) => {
  try {
    const { period = 'month', months = 12 } = req.query;
    const data = [];
    
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const quoteRevenue = db.prepare(`
        SELECT COALESCE(SUM(total), 0) as amount
        FROM quotes 
        WHERE user_id = ? AND status = 'accepted' AND DATE(accepted_at) BETWEEN ? AND ?
      `).get(req.user.id, monthStart, monthEnd);
      
      const invoiceRevenue = db.prepare(`
        SELECT COALESCE(SUM(payment_amount), 0) as amount
        FROM invoices 
        WHERE user_id = ? AND DATE(paid_at) BETWEEN ? AND ?
      `).get(req.user.id, monthStart, monthEnd);
      
      data.push({
        period: date.toISOString().substring(0, 7), // YYYY-MM format
        quoted: quoteRevenue.amount || 0,
        invoiced: invoiceRevenue.amount || 0,
        total: (quoteRevenue.amount || 0) + (invoiceRevenue.amount || 0)
      });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Revenue report error:', err);
    res.status(500).json({ error: 'Failed to generate revenue report' });
  }
});

// Top clients report
router.get('/top-clients', (req, res) => {
  try {
    const { limit = 10, period = 'year' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    }
    
    const topClients = db.prepare(`
      SELECT 
        client_name,
        client_email,
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotes,
        SUM(total) as total_quoted,
        SUM(CASE WHEN status = 'accepted' THEN total ELSE 0 END) as total_revenue,
        AVG(total) as avg_quote_value
      FROM quotes 
      WHERE user_id = ? AND DATE(created_at) >= ? AND client_name IS NOT NULL
      GROUP BY client_name, client_email
      ORDER BY total_revenue DESC
      LIMIT ?
    `).all(req.user.id, startDate, parseInt(limit));
    
    res.json(topClients);
  } catch (err) {
    console.error('Top clients report error:', err);
    res.status(500).json({ error: 'Failed to generate top clients report' });
  }
});

// Quote performance report
router.get('/quote-performance', (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek.toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
    }
    
    // Performance by trade type
    const tradeTypeStats = db.prepare(`
      SELECT 
        trade_type,
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotes,
        ROUND(AVG(CASE WHEN status = 'accepted' THEN 100.0 ELSE 0 END), 2) as acceptance_rate,
        SUM(total) as total_quoted,
        AVG(total) as avg_quote_value
      FROM quotes 
      WHERE user_id = ? AND DATE(created_at) >= ? AND trade_type IS NOT NULL
      GROUP BY trade_type
      ORDER BY acceptance_rate DESC
    `).all(req.user.id, startDate);
    
    // Performance by quote value ranges
    const valueRangeStats = db.prepare(`
      SELECT 
        CASE 
          WHEN total < 500 THEN 'Under $500'
          WHEN total < 1000 THEN '$500 - $1,000'
          WHEN total < 2500 THEN '$1,000 - $2,500'
          WHEN total < 5000 THEN '$2,500 - $5,000'
          WHEN total < 10000 THEN '$5,000 - $10,000'
          ELSE 'Over $10,000'
        END as value_range,
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotes,
        ROUND(AVG(CASE WHEN status = 'accepted' THEN 100.0 ELSE 0 END), 2) as acceptance_rate
      FROM quotes 
      WHERE user_id = ? AND DATE(created_at) >= ?
      GROUP BY value_range
      ORDER BY MIN(total)
    `).all(req.user.id, startDate);
    
    res.json({
      trade_types: tradeTypeStats,
      value_ranges: valueRangeStats
    });
  } catch (err) {
    console.error('Quote performance report error:', err);
    res.status(500).json({ error: 'Failed to generate quote performance report' });
  }
});

// Outstanding invoices report
router.get('/outstanding-invoices', (req, res) => {
  try {
    const overdueInvoices = db.prepare(`
      SELECT *
      FROM invoices 
      WHERE user_id = ? AND status IN ('sent', 'partial') AND DATE(due_date) < DATE('now')
      ORDER BY due_date ASC
    `).all(req.user.id);
    
    const upcomingInvoices = db.prepare(`
      SELECT *
      FROM invoices 
      WHERE user_id = ? AND status IN ('sent', 'partial') AND DATE(due_date) >= DATE('now')
      ORDER BY due_date ASC
    `).all(req.user.id);
    
    const totals = db.prepare(`
      SELECT 
        COUNT(CASE WHEN status IN ('sent', 'partial') AND DATE(due_date) < DATE('now') THEN 1 END) as overdue_count,
        SUM(CASE WHEN status IN ('sent', 'partial') AND DATE(due_date) < DATE('now') THEN (total - COALESCE(payment_amount, 0)) ELSE 0 END) as overdue_amount,
        COUNT(CASE WHEN status IN ('sent', 'partial') THEN 1 END) as outstanding_count,
        SUM(CASE WHEN status IN ('sent', 'partial') THEN (total - COALESCE(payment_amount, 0)) ELSE 0 END) as outstanding_amount
      FROM invoices 
      WHERE user_id = ?
    `).get(req.user.id);
    
    res.json({
      overdue: overdueInvoices,
      upcoming: upcomingInvoices,
      totals
    });
  } catch (err) {
    console.error('Outstanding invoices report error:', err);
    res.status(500).json({ error: 'Failed to generate outstanding invoices report' });
  }
});

// Time tracking report
router.get('/time-tracking', (req, res) => {
  try {
    const { start_date, end_date, job_id, client_id } = req.query;
    
    let sql = `SELECT 
      t.*, 
      j.title as job_title,
      c.name as client_name
      FROM timesheets t
      LEFT JOIN jobs j ON t.job_id = j.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.user_id = ? AND t.status = 'completed'`;
    const params = [req.user.id];
    
    if (start_date) { sql += ' AND DATE(t.start_time) >= ?'; params.push(start_date); }
    if (end_date) { sql += ' AND DATE(t.start_time) <= ?'; params.push(end_date); }
    if (job_id) { sql += ' AND t.job_id = ?'; params.push(job_id); }
    if (client_id) { sql += ' AND t.client_id = ?'; params.push(client_id); }
    
    sql += ' ORDER BY t.start_time DESC';
    
    const timesheets = db.prepare(sql).all(...params);
    
    // Summary
    const summary = db.prepare(sql.replace('t.*, j.title as job_title, c.name as client_name', 
      'COUNT(*) as total_entries, SUM(t.total_hours) as total_hours, SUM(t.total_amount) as total_amount, AVG(t.hourly_rate) as avg_rate')).get(...params);
    
    res.json({
      timesheets,
      summary
    });
  } catch (err) {
    console.error('Time tracking report error:', err);
    res.status(500).json({ error: 'Failed to generate time tracking report' });
  }
});

export default router;