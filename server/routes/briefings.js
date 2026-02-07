import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get recent briefings
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    let briefings = db.prepare('SELECT * FROM briefings ORDER BY created_at DESC LIMIT ?').all(limit);

    // If no briefings in DB, return mock data
    if (briefings.length === 0) {
      briefings = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          content: 'System health check completed. All services operational.',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          content: 'Backup completed successfully. 3 containers running on docker02.',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          content: 'Weekly summary: 47 tasks completed, system uptime 99.9%.',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    }

    res.json({
      success: true,
      data: briefings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new briefing
router.post('/', (req, res) => {
  try {
    const { date, content } = req.body;

    if (!date || !content) {
      return res.status(400).json({
        success: false,
        error: 'Date and content are required'
      });
    }

    const stmt = db.prepare('INSERT INTO briefings (date, content) VALUES (?, ?)');
    const result = stmt.run(date, content);

    res.json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        date,
        content
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
