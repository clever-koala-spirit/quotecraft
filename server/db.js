import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'quotecraft.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS business_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
    business_name TEXT,
    abn TEXT,
    licence_number TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    logo TEXT,
    payment_terms TEXT,
    bank_details TEXT,
    trade_type TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    client_address TEXT,
    trade_type TEXT,
    job_description TEXT,
    status TEXT DEFAULT 'draft',
    subtotal REAL DEFAULT 0,
    gst REAL DEFAULT 0,
    total REAL DEFAULT 0,
    validity_days INTEGER DEFAULT 30,
    notes TEXT,
    business_snapshot TEXT,
    sent_at TEXT,
    viewed_at TEXT,
    accepted_at TEXT,
    declined_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    template TEXT DEFAULT 'clean-modern',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    description TEXT,
    quantity REAL DEFAULT 1,
    unit TEXT DEFAULT 'each',
    unit_price REAL DEFAULT 0,
    total REAL DEFAULT 0,
    category TEXT DEFAULT 'labour',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS quote_attachments (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT,
    mime_type TEXT,
    size INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quote_events (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_chat_conv ON chat_messages(conversation_id, user_id);
`);

// CRM tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company TEXT,
    tags TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS client_timeline (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    client_id TEXT,
    quote_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT DEFAULT 'lead',
    value REAL,
    scheduled_date TEXT,
    completed_date TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS followups (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    client_id TEXT,
    quote_id TEXT,
    job_id TEXT,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    completed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
  CREATE INDEX IF NOT EXISTS idx_timeline_client ON client_timeline(client_id);
  CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(user_id);
  CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
  CREATE INDEX IF NOT EXISTS idx_followups_user ON followups(user_id);
  CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date);
`);

// Migrations for existing databases
try { db.exec(`ALTER TABLE quotes ADD COLUMN template TEXT DEFAULT 'clean-modern'`); } catch(e) { /* column exists */ }
try { db.exec(`CREATE TABLE IF NOT EXISTS quote_attachments (id TEXT PRIMARY KEY, quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE, filename TEXT NOT NULL, original_name TEXT, mime_type TEXT, size INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`); } catch(e) { /* exists */ }

export default db;
