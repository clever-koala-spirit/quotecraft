import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();
router.use(authenticateToken);

// Start timer
router.post('/start', (req, res) => {
  try {
    const { job_id, client_id, description, hourly_rate } = req.body;
    
    // Check for active timer
    const activeTimer = db.prepare('SELECT * FROM timesheets WHERE user_id = ? AND status = ? ORDER BY start_time DESC LIMIT 1')
      .get(req.user.id, 'active');
    
    if (activeTimer) {
      return res.status(400).json({ error: 'Timer already running. Stop current timer first.' });
    }
    
    const id = uuid();
    const startTime = new Date().toISOString();
    
    db.prepare(`INSERT INTO timesheets (id, user_id, job_id, client_id, start_time, description, hourly_rate, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, job_id || null, client_id || null, startTime, description || '', hourly_rate || 0, 'active'
    );
    
    res.json(getTimesheetWithDetails(id));
  } catch (err) {
    console.error('Start timer error:', err);
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

// Stop timer
router.post('/:id/stop', (req, res) => {
  try {
    const timesheet = db.prepare('SELECT * FROM timesheets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!timesheet) return res.status(404).json({ error: 'Timesheet not found' });
    
    const endTime = new Date().toISOString();
    const startTime = new Date(timesheet.start_time);
    const totalHours = (new Date(endTime) - startTime) / (1000 * 60 * 60);
    const totalAmount = totalHours * (timesheet.hourly_rate || 0);
    
    db.prepare(`UPDATE timesheets SET end_time = ?, total_hours = ?, total_amount = ?, status = ?
      WHERE id = ?`).run(endTime, totalHours, totalAmount, 'completed', req.params.id);
    
    res.json(getTimesheetWithDetails(req.params.id));
  } catch (err) {
    console.error('Stop timer error:', err);
    res.status(500).json({ error: 'Failed to stop timer' });
  }
});

// Create manual timesheet entry
router.post('/', (req, res) => {
  try {
    const { job_id, client_id, start_time, end_time, total_hours, hourly_rate, description } = req.body;
    
    if (!start_time || (!end_time && !total_hours)) {
      return res.status(400).json({ error: 'Start time and either end time or total hours are required' });
    }
    
    const id = uuid();
    let calculatedHours = total_hours;
    let calculatedEndTime = end_time;
    
    if (!total_hours && end_time) {
      calculatedHours = (new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60);
    } else if (total_hours && !end_time) {
      calculatedEndTime = new Date(new Date(start_time).getTime() + total_hours * 60 * 60 * 1000).toISOString();
    }
    
    const totalAmount = calculatedHours * (hourly_rate || 0);
    
    db.prepare(`INSERT INTO timesheets (id, user_id, job_id, client_id, start_time, end_time, total_hours, 
      hourly_rate, total_amount, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, job_id || null, client_id || null, start_time, calculatedEndTime, 
      calculatedHours, hourly_rate || 0, totalAmount, description || '', 'completed'
    );
    
    res.json(getTimesheetWithDetails(id));
  } catch (err) {
    console.error('Create timesheet error:', err);
    res.status(500).json({ error: 'Failed to create timesheet entry' });
  }
});

// List timesheets
router.get('/', (req, res) => {
  try {
    const { job_id, client_id, status, start_date, end_date, limit = 50 } = req.query;
    
    let sql = `SELECT t.*, j.title as job_title, c.name as client_name 
      FROM timesheets t 
      LEFT JOIN jobs j ON t.job_id = j.id 
      LEFT JOIN clients c ON t.client_id = c.id 
      WHERE t.user_id = ?`;
    const params = [req.user.id];
    
    if (job_id) { sql += ' AND t.job_id = ?'; params.push(job_id); }
    if (client_id) { sql += ' AND t.client_id = ?'; params.push(client_id); }
    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    if (start_date) { sql += ' AND DATE(t.start_time) >= ?'; params.push(start_date); }
    if (end_date) { sql += ' AND DATE(t.start_time) <= ?'; params.push(end_date); }
    
    sql += ' ORDER BY t.start_time DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const timesheets = db.prepare(sql).all(...params);
    res.json(timesheets);
  } catch (err) {
    console.error('List timesheets error:', err);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// Get active timer
router.get('/active', (req, res) => {
  try {
    const activeTimer = db.prepare(`SELECT t.*, j.title as job_title, c.name as client_name 
      FROM timesheets t 
      LEFT JOIN jobs j ON t.job_id = j.id 
      LEFT JOIN clients c ON t.client_id = c.id 
      WHERE t.user_id = ? AND t.status = ? 
      ORDER BY t.start_time DESC LIMIT 1`).get(req.user.id, 'active');
    
    res.json(activeTimer || null);
  } catch (err) {
    console.error('Get active timer error:', err);
    res.status(500).json({ error: 'Failed to get active timer' });
  }
});

// Single timesheet
router.get('/:id', (req, res) => {
  try {
    const timesheet = getTimesheetWithDetails(req.params.id);
    if (!timesheet || timesheet.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }
    res.json(timesheet);
  } catch (err) {
    console.error('Get timesheet error:', err);
    res.status(500).json({ error: 'Failed to get timesheet' });
  }
});

// Update timesheet
router.put('/:id', (req, res) => {
  try {
    const timesheet = db.prepare('SELECT * FROM timesheets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!timesheet) return res.status(404).json({ error: 'Timesheet not found' });
    
    const { start_time, end_time, total_hours, hourly_rate, description } = req.body;
    
    let updatedHours = total_hours || timesheet.total_hours;
    let updatedEndTime = end_time || timesheet.end_time;
    
    if (start_time && end_time && !total_hours) {
      updatedHours = (new Date(end_time) - new Date(start_time)) / (1000 * 60 * 60);
    }
    
    const totalAmount = updatedHours * (hourly_rate || timesheet.hourly_rate);
    
    db.prepare(`UPDATE timesheets SET start_time = ?, end_time = ?, total_hours = ?, 
      hourly_rate = ?, total_amount = ?, description = ? WHERE id = ?`).run(
      start_time || timesheet.start_time, updatedEndTime, updatedHours, 
      hourly_rate || timesheet.hourly_rate, totalAmount, description || timesheet.description, req.params.id
    );
    
    res.json(getTimesheetWithDetails(req.params.id));
  } catch (err) {
    console.error('Update timesheet error:', err);
    res.status(500).json({ error: 'Failed to update timesheet' });
  }
});

// Delete timesheet
router.delete('/:id', (req, res) => {
  try {
    const timesheet = db.prepare('SELECT * FROM timesheets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!timesheet) return res.status(404).json({ error: 'Timesheet not found' });
    
    db.prepare('DELETE FROM timesheets WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete timesheet error:', err);
    res.status(500).json({ error: 'Failed to delete timesheet' });
  }
});

// Get timesheet summary (total hours and earnings)
router.get('/summary/:period', (req, res) => {
  try {
    const { period } = req.params; // 'week', 'month', 'year'
    const { job_id, client_id } = req.query;
    
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
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        return res.status(400).json({ error: 'Invalid period. Use week, month, or year' });
    }
    
    let sql = `SELECT 
      COUNT(*) as total_entries,
      SUM(total_hours) as total_hours,
      SUM(total_amount) as total_amount,
      AVG(hourly_rate) as avg_hourly_rate
      FROM timesheets WHERE user_id = ? AND status = 'completed' AND DATE(start_time) >= ?`;
    const params = [req.user.id, startDate];
    
    if (job_id) { sql += ' AND job_id = ?'; params.push(job_id); }
    if (client_id) { sql += ' AND client_id = ?'; params.push(client_id); }
    
    const summary = db.prepare(sql).get(...params);
    res.json(summary);
  } catch (err) {
    console.error('Get timesheet summary error:', err);
    res.status(500).json({ error: 'Failed to get timesheet summary' });
  }
});

function getTimesheetWithDetails(timesheetId) {
  const timesheet = db.prepare(`SELECT t.*, j.title as job_title, c.name as client_name 
    FROM timesheets t 
    LEFT JOIN jobs j ON t.job_id = j.id 
    LEFT JOIN clients c ON t.client_id = c.id 
    WHERE t.id = ?`).get(timesheetId);
  
  return timesheet;
}

export default router;