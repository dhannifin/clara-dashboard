import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

// Parse OpenClaw cron list output into structured data
function parseCronList(output) {
  const jobs = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Match lines with job ID pattern (UUID-like)
    const match = line.match(/^(\S{36})\s+(.+?)\s+(enabled|disabled)\s+(.+)$/);
    if (match) {
      const [, id, name, status, schedule] = match;
      jobs.push({
        id: id.trim(),
        name: name.trim(),
        status: status.trim(),
        schedule: schedule.trim(),
        enabled: status.trim() === 'enabled'
      });
    }
  }
  
  return jobs;
}

// GET /api/cron-status - Live cron job data
router.get('/cron-status', async (req, res) => {
  try {
    let jobs = [];
    let source = 'live';
    
    try {
      // Try to get OpenClaw cron list
      const { stdout } = await execAsync('openclaw cron list');
      
      if (stdout && stdout.trim()) {
        jobs = parseCronList(stdout);
      }
      
      // If no jobs parsed, try alternative parsing
      if (jobs.length === 0) {
        // Try JSON format if available
        try {
          const { stdout: jsonOutput } = await execAsync('openclaw cron list --json 2>/dev/null || echo "[]"');
          const parsed = JSON.parse(jsonOutput);
          if (Array.isArray(parsed) && parsed.length > 0) {
            jobs = parsed.map(j => ({
              id: j.id || j.jobId,
              name: j.name,
              status: j.enabled ? 'enabled' : 'disabled',
              schedule: j.schedule?.expr || j.schedule?.kind || 'unknown',
              enabled: j.enabled
            }));
          }
        } catch (jsonErr) {
          // JSON parsing failed, continue with text parsing
        }
      }
      
      // If still no jobs, do simple line-based parsing
      if (jobs.length === 0) {
        const lines = stdout.split('\n').filter(l => l.trim() && !l.includes('no jobs'));
        jobs = lines.map((line, idx) => ({
          id: `job-${idx}`,
          name: line.trim().substring(0, 50),
          status: 'active',
          schedule: 'unknown',
          enabled: true
        }));
      }
    } catch (error) {
      console.error('Failed to fetch cron jobs:', error.message);
      source = 'fallback';
      // Provide some fallback data so UI doesn't break
      jobs = [
        { id: '1', name: 'Morning Text', status: 'enabled', schedule: '7:30 AM Mon-Fri', enabled: true },
        { id: '2', name: 'Quiet Time Reminder', status: 'enabled', schedule: '7:45 AM Mon-Fri', enabled: true },
        { id: '3', name: 'Workout Reminder', status: 'enabled', schedule: '12:00 PM Mon/Wed/Fri', enabled: true }
      ];
    }

    res.json({
      status: 'running',
      activeJobs: jobs.filter(j => j.enabled).length,
      totalJobs: jobs.length,
      jobs: jobs,
      source: source,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// GET / - Basic health info with cron summary
router.get('/', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Use /api/cron-status for detailed cron job information'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;
