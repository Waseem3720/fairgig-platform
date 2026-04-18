const express = require('express');
const db = require('./database');
const { authenticateToken, requireRole } = require('./auth');

const router = express.Router();

// ──────────────────────────────────────────
// Create Complaint (Worker)
// ──────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  const { platform, category, title, description, is_anonymous, city, zone } = req.body;

  if (!platform || !category || !title || !description) {
    return res.status(400).json({ detail: 'platform, category, title, and description are required' });
  }

  try {
    const query = `
      INSERT INTO complaints (worker_id, platform, category, title, description, is_anonymous, city, zone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await db.query(query, [
      req.user.id, platform, category, title, description,
      is_anonymous ? 1 : 0, city || null, zone || null
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ──────────────────────────────────────────
// List Complaints
// ──────────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  const { platform, category, status, city, limit = 50, offset = 0 } = req.query;

  let queryText = 'SELECT * FROM complaints WHERE 1=1';
  const params = [];
  let paramCount = 1;

  if (req.user.role === 'worker') {
    queryText += ` AND worker_id = $${paramCount++}`;
    params.push(req.user.id);
  }

  if (platform) { queryText += ` AND platform = $${paramCount++}`; params.push(platform); }
  if (category) { queryText += ` AND category = $${paramCount++}`; params.push(category); }
  if (status) { queryText += ` AND status = $${paramCount++}`; params.push(status); }
  if (city) { queryText += ` AND city = $${paramCount++}`; params.push(city); }

  queryText += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(parseInt(limit), parseInt(offset));

  try {
    const result = await db.query(queryText, params);
    const complaints = result.rows;

    for (const complaint of complaints) {
      const tagRes = await db.query('SELECT tag FROM complaint_tags WHERE complaint_id = $1', [complaint.id]);
      complaint.tags = tagRes.rows.map(t => t.tag);
      if (complaint.is_anonymous && complaint.worker_id !== req.user.id && req.user.role === 'worker') {
        complaint.worker_id = null;
      }
    }
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ──────────────────────────────────────────
// Get Single Complaint
// ──────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const cRes = await db.query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
    if (cRes.rows.length === 0) return res.status(404).json({ detail: 'Complaint not found' });
    const complaint = cRes.rows[0];

    const tagRes = await db.query('SELECT * FROM complaint_tags WHERE complaint_id = $1', [complaint.id]);
    complaint.tags = tagRes.rows;

    const rRes = await db.query('SELECT * FROM complaint_responses WHERE complaint_id = $1 ORDER BY created_at', [complaint.id]);
    complaint.responses = rRes.rows;

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ──────────────────────────────────────────
// Update Complaint Status (Advocate)
// ──────────────────────────────────────────
router.put('/:id/status', authenticateToken, requireRole('advocate', 'verifier'), async (req, res) => {
  const { status, priority } = req.body;
  try {
    const cRes = await db.query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
    if (cRes.rows.length === 0) return res.status(404).json({ detail: 'Complaint not found' });

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) { updates.push(`status = $${paramCount++}`); params.push(status); }
    if (priority) { updates.push(`priority = $${paramCount++}`); params.push(priority); }
    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(req.params.id);
      
      await db.query(`UPDATE complaints SET ${updates.join(', ')} WHERE id = $${paramCount}`, params);
      const updated = await db.query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
      res.json(updated.rows[0]);
    } else {
      res.json(cRes.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ──────────────────────────────────────────
// Add Tags (Advocate)
// ──────────────────────────────────────────
router.post('/:id/tags', authenticateToken, requireRole('advocate', 'verifier'), async (req, res) => {
  const { tags } = req.body;
  if (!tags || !Array.isArray(tags)) {
    return res.status(400).json({ detail: 'tags must be an array of strings' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    for (const tag of tags) {
      await client.query(
        'INSERT INTO complaint_tags (complaint_id, tag, tagged_by) VALUES ($1, $2, $3)',
        [req.params.id, tag, req.user.id]
      );
    }
    await client.query('COMMIT');
    
    const allTags = await db.query('SELECT * FROM complaint_tags WHERE complaint_id = $1', [req.params.id]);
    res.json({ complaint_id: parseInt(req.params.id), tags: allTags.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ detail: err.message });
  } finally {
    client.release();
  }
});

// ──────────────────────────────────────────
// Add Response to Complaint
// ──────────────────────────────────────────
router.post('/:id/respond', authenticateToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ detail: 'message is required' });

  try {
    await db.query(
      `INSERT INTO complaint_responses (complaint_id, responder_id, responder_role, message) VALUES ($1, $2, $3, $4)`,
      [req.params.id, req.user.id, req.user.role, message]
    );
    const responses = await db.query('SELECT * FROM complaint_responses WHERE complaint_id = $1 ORDER BY created_at', [req.params.id]);
    res.json(responses.rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ──────────────────────────────────────────
// Cluster Similar Complaints (Advocate)
// ──────────────────────────────────────────
router.get('/clusters/by-category', authenticateToken, requireRole('advocate', 'verifier'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT category, platform, COUNT(*) as count,
             SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
             SUM(CASE WHEN status = 'escalated' THEN 1 ELSE 0 END) as escalated_count,
             SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM complaints
      GROUP BY category, platform
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// ──────────────────────────────────────────
// Complaint Stats (for Analytics)
// ──────────────────────────────────────────
router.get('/stats/summary', authenticateToken, requireRole('advocate', 'verifier'), async (req, res) => {
  try {
    const total = await db.query('SELECT COUNT(*) as count FROM complaints');
    const byCategory = await db.query('SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC');
    const byStatus = await db.query('SELECT status, COUNT(*) as count FROM complaints GROUP BY status');
    const byPlatform = await db.query('SELECT platform, COUNT(*) as count FROM complaints GROUP BY platform ORDER BY count DESC');
    const thisWeek = await db.query(`
      SELECT category, COUNT(*) as count FROM complaints
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      GROUP BY category ORDER BY count DESC
    `);

    res.json({
      total: parseInt(total.rows[0].count),
      by_category: byCategory.rows,
      by_status: byStatus.rows,
      by_platform: byPlatform.rows,
      this_week: thisWeek.rows,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
