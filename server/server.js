const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'clara.db');

// Middleware
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  initializeDatabase();
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Cron jobs table
    db.run(`
      CREATE TABLE IF NOT EXISTS cron_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        schedule TEXT NOT NULL,
        last_run DATETIME,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backup status table
    db.run(`
      CREATE TABLE IF NOT EXISTS backup_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        backup_name TEXT NOT NULL,
        status TEXT NOT NULL,
        size_bytes INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database schema initialized');
  });
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  db.get('SELECT 1', (err) => {
    if (err) {
      return res.status(503).json({
        status: 'unhealthy',
        message: 'Database connection failed',
        error: err.message
      });
    }
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
});

// Get cron job status
app.get('/api/cron-status', (req, res) => {
  db.all('SELECT * FROM cron_jobs ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: 'Failed to fetch cron jobs',
        message: err.message
      });
    }
    res.json({
      count: rows.length,
      jobs: rows
    });
  });
});

// Get backup status
app.get('/api/backup-status', (req, res) => {
  db.all('SELECT * FROM backup_status ORDER BY completed_at DESC LIMIT 10', (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: 'Failed to fetch backup status',
        message: err.message
      });
    }
    res.json({
      count: rows.length,
      backups: rows
    });
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database connection');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(err ? 1 : 0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database path: ${DB_PATH}`);
});
