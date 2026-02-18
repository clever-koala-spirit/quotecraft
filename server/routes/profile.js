import { Router } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';
import { mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '..', 'uploads', 'logos');
mkdirSync(uploadsDir, { recursive: true });

const router = Router();

// Logo upload config
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${extname(file.originalname)}`);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.get('/', authenticateToken, (req, res) => {
  const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
  res.json(profile || {});
});

// Upload logo
router.post('/logo', authenticateToken, logoUpload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoPath = `/api/profile/logo/${req.file.filename}`;
    
    // Update profile with logo path
    const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
    if (profile) {
      db.prepare('UPDATE business_profiles SET logo = ?, updated_at = datetime(\'now\') WHERE user_id = ?')
        .run(logoPath, req.user.id);
    } else {
      db.prepare('INSERT INTO business_profiles (id, user_id, logo) VALUES (?, ?, ?)')
        .run(uuid(), req.user.id, logoPath);
    }

    res.json({ logo: logoPath, message: 'Logo uploaded successfully' });
  } catch (err) {
    console.error('Logo upload error:', err);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Serve logo files
router.get('/logo/:filename', authenticateToken, (req, res) => {
  const filePath = join(uploadsDir, req.params.filename);
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'Logo not found' });
  }
  res.sendFile(filePath);
});

router.put('/', authenticateToken, (req, res) => {
  try {
    const fields = [
      'business_name', 'abn', 'licence_number', 'phone', 'email', 'address', 'logo', 
      'payment_terms', 'bank_details', 'trade_type', 'invoice_terms', 'quote_numbering_format', 
      'invoice_numbering_format', 'gst_rate', 'default_payment_terms'
    ];
    
    let profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
    
    if (!profile) {
      // Create new profile
      const id = uuid();
      db.prepare(`INSERT INTO business_profiles (id, user_id, business_name, phone, email, trade_type, gst_rate, default_payment_terms, quote_numbering_format, invoice_numbering_format)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, req.user.id, req.body.business_name || '', req.body.phone || '', req.body.email || '', 
        req.body.trade_type || '', req.body.gst_rate || 0.10, req.body.default_payment_terms || '30 days',
        req.body.quote_numbering_format || 'QC-{number}', req.body.invoice_numbering_format || 'INV-{number}'
      );
      profile = { id, user_id: req.user.id };
    }
    
    const updates = [];
    const values = [];
    
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
    
    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(profile.id);
      db.prepare(`UPDATE business_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
    const updated = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
    res.json(updated);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get numbering settings
router.get('/numbering', authenticateToken, (req, res) => {
  try {
    const profile = db.prepare(`SELECT quote_numbering_format, invoice_numbering_format, 
      next_quote_number, next_invoice_number FROM business_profiles WHERE user_id = ?`).get(req.user.id);
    
    res.json(profile || {
      quote_numbering_format: 'QC-{number}',
      invoice_numbering_format: 'INV-{number}',
      next_quote_number: 1,
      next_invoice_number: 1
    });
  } catch (err) {
    console.error('Get numbering error:', err);
    res.status(500).json({ error: 'Failed to get numbering settings' });
  }
});

// Update numbering settings
router.put('/numbering', authenticateToken, (req, res) => {
  try {
    const { quote_numbering_format, invoice_numbering_format, next_quote_number, next_invoice_number } = req.body;
    
    const profile = db.prepare('SELECT * FROM business_profiles WHERE user_id = ?').get(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please update your business profile first.' });
    }
    
    const updates = [];
    const values = [];
    
    if (quote_numbering_format !== undefined) {
      updates.push('quote_numbering_format = ?');
      values.push(quote_numbering_format);
    }
    if (invoice_numbering_format !== undefined) {
      updates.push('invoice_numbering_format = ?');
      values.push(invoice_numbering_format);
    }
    if (next_quote_number !== undefined) {
      updates.push('next_quote_number = ?');
      values.push(parseInt(next_quote_number));
    }
    if (next_invoice_number !== undefined) {
      updates.push('next_invoice_number = ?');
      values.push(parseInt(next_invoice_number));
    }
    
    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(profile.id);
      db.prepare(`UPDATE business_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
    res.json({ success: true, message: 'Numbering settings updated' });
  } catch (err) {
    console.error('Update numbering error:', err);
    res.status(500).json({ error: 'Failed to update numbering settings' });
  }
});

export default router;
