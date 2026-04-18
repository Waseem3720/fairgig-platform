const express = require('express');
const db = require('./database');
const { authenticateToken, requireRole } = require('./auth');

const router = express.Router();

// ──────────────────────────────────────────
// Create Complaint (Worker)
// ──────────────────────────────────────────
router.post('/', authenticateToken, (req, res) => {
  const { platform, category, title, description, is_anonymous, city, zone } = req.body;

  if (!platform || !category || !title || !description) {
    return res.status(400).json({ detail: 'platform, category, title, and description are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO complaints (worker_id, platform, category, title, description, is_anonymous, city, zone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    req.user.id, platform, category, title, description,
    is_anonymous ? 1 : 0, city || null, zone || null
  );

  const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(complaint);
});

// ──────────────────────────────────────────
// List Complaints
// ──────────────────────────────────────────
router.get('/', authenticateToken, (req, res) => {
  const { platform, category, status, city, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT * FROM complaints WHERE 1=1';
  const params = [];

  // Workers see only their own; advocates/verifiers see all
  if (req.user.role === 'worker') {
    query += ' AND worker_id = ?';
    params.push(req.user.id);
  }

  if (platform) { query += ' AND platform = ?'; params.push(platform); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (city) { query += ' AND city = ?'; params.push(city); }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const complaints = db.prepare(query).all(...params);

  // Attach tags to each complaint
  const tagStmt = db.prepare('SELECT tag FROM complaint_tags WHERE complaint_id = ?');
  for (const complaint of complaints) {
    complaint.tags = tagStmt.all(complaint.id).map(t => t.tag);
    // Hide worker_id if anonymous (for non-owner viewers)
    if (complaint.is_anonymous && complaint.worker_id !== req.user.id && req.user.role === 'worker') {
      complaint.worker_id = null;
    }
  }

  res.json(complaints);
});

// ──────────────────────────────────────────
// Get Single Complaint
// ──────────────────────────────────────────
router.get('/:id', authenticateToken, (req, res) => {
  const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
  if (!complaint) return res.status(404).json({ detail: 'Complaint not found' });

  complaint.tags = db.prepare('SELECT * FROM complaint_tags WHERE complaint_id = ?').all(complaint.id);
  complaint.responses = db.prepare('SELECT * FROM complaint_responses WHERE complaint_id = ? ORDER BY created_at').all(complaint.id);

  res.json(complaint);
});

// ──────────────────────────────────────────
// Update Complaint Status (Advocate)
// ──────────────────────────────────────────
router.put('/:id/status', authenticateToken, requireRole('advocate', 'verifier'), (req, res) => {
  const { status, priority } = req.body;

  const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
  if (!complaint) return res.status(404).json({ detail: 'Complaint not found' });

  const updates = [];
  const params = [];

  if (status) { updates.push('status = ?'); params.push(status); }
  if (priority) { updates.push('priority = ?'); params.push(priority); }
  updates.push("updated_at = datetime('now')");

  params.push(req.params.id);
  db.prepare(`UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ──────────────────────────────────────────
// Add Tags (Advocate)
// ──────────────────────────────────────────
router.post('/:id/tags', authenticateToken, requireRole('advocate', 'verifier'), (req, res) => {
  const { tags } = req.body; // Array of tag strings

  if (!tags || !Array.isArray(tags)) {
    return res.status(400).json({ detail: 'tags must be an array of strings' });
  }

  const stmt = db.prepare('INSERT INTO complaint_tags (complaint_id, tag, tagged_by) VALUES (?, ?, ?)');
  const insertMany = db.transaction((tags) => {
    for (const tag of tags) {
      stmt.run(req.params.id, tag, req.user.id);
    }
  });

  insertMany(tags);

  const allTags = db.prepare('SELECT * FROM complaint_tags WHERE complaint_id = ?').all(req.params.id);
  res.json({ complaint_id: parseInt(req.params.id), tags: allTags });
});

// ──────────────────────────────────────────
// Add Response to Complaint
// ──────────────────────────────────────────
router.post('/:id/respond', authenticateToken, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ detail: 'message is required' });

  const stmt = db.prepare(`
    INSERT INTO complaint_responses (complaint_id, responder_id, responder_role, message)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(req.params.id, req.user.id, req.user.role, message);

  const responses = db.prepare('SELECT * FROM complaint_responses WHERE complaint_id = ? ORDER BY created_at').all(req.params.id);
  res.json(responses);
});

// ──────────────────────────────────────────
// Cluster Similar Complaints (Advocate)
// ──────────────────────────────────────────
router.get('/clusters/by-category', authenticateToken, requireRole('advocate', 'verifier'), (req, res) => {
  const clusters = db.prepare(`
    SELECT category, platform, COUNT(*) as count,
           SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
           SUM(CASE WHEN status = 'escalated' THEN 1 ELSE 0 END) as escalated_count,
           SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
    FROM complaints
    GROUP BY category, platform
    ORDER BY count DESC
  `).all();

  res.json(clusters);
});

// ──────────────────────────────────────────
// Complaint Stats (for Analytics)
// ──────────────────────────────────────────
router.get('/stats/summary', authenticateToken, requireRole('advocate', 'verifier'), (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM complaints').get();
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count FROM complaints
    GROUP BY category ORDER BY count DESC
  `).all();
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM complaints
    GROUP BY status
  `).all();
  const byPlatform = db.prepare(`
    SELECT platform, COUNT(*) as count FROM complaints
    GROUP BY platform ORDER BY count DESC
  `).all();
  const thisWeek = db.prepare(`
    SELECT category, COUNT(*) as count FROM complaints
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY category ORDER BY count DESC
  `).all();

  res.json({
    total: total.count,
    by_category: byCategory,
    by_status: byStatus,
    by_platform: byPlatform,
    this_week: thisWeek,
  });
});

module.exports = router;
