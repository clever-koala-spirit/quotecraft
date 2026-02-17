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

  CREATE TABLE IF NOT EXISTS quote_events (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
