const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'grievance.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'under_review', 'escalated', 'resolved', 'dismissed')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    is_anonymous INTEGER DEFAULT 0,
    city TEXT,
    zone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS complaint_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    tagged_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS complaint_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    responder_id INTEGER NOT NULL,
    responder_role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_complaints_worker ON complaints(worker_id);
  CREATE INDEX IF NOT EXISTS idx_complaints_platform ON complaints(platform);
  CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
  CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
  CREATE INDEX IF NOT EXISTS idx_tags_complaint ON complaint_tags(complaint_id);
`);

module.exports = db;
