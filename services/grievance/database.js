const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/grievance_db'
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS complaint_tags (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL,
        tag TEXT NOT NULL,
        tagged_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS complaint_responses (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL,
        responder_id INTEGER NOT NULL,
        responder_role TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_complaints_worker ON complaints(worker_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_platform ON complaints(platform);
      CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
      CREATE INDEX IF NOT EXISTS idx_tags_complaint ON complaint_tags(complaint_id);
    `);
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
  pool
};
