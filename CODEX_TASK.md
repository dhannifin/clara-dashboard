# Clara Dashboard Enhancement Task

## Current Problem
The Clara Dashboard at http://192.168.5.82:8081 is using hardcoded mock data:
- Cron jobs are static (only 6 hardcoded jobs, doesn't show new jobs like quiet time/workout reminders)
- Backup status has fallback to fake date "2026-02-10 03:00"
- No dynamic querying of OpenClaw

## Goal
Build a proper backend that:
1. Queries OpenClaw's cron API to get live job data
2. Reads actual backup files from /Users/nora/.openclaw-backups
3. Displays accurate, real-time information

## Files to Work With

### Server Structure (in /server directory):
- server/index.js - Main Express server
- server/routes/health.js - Cron job routes (needs fixing)
- server/routes/backups.js - Backup routes (needs fixing)
- server/db.js - Database initialization

### Current docker-compose.yml issues:
- Uses inline server.js with hardcoded data
- Needs to be replaced with proper Node.js backend build

## Implementation Requirements

### 1. Fix Health/Cron Routes
Update server/routes/health.js to:
- Execute `openclaw cron list --json` (or parse output)
- Return actual cron jobs with: name, schedule, status, lastRun
- Handle errors gracefully

### 2. Fix Backup Routes  
Update server/routes/backups.js to:
- Read from /backups volume (mounted at /backups in container)
- List .tar.gz files, sort by date
- Return: lastBackup (formatted), totalBackups, totalSize, recentBackups

### 3. Update docker-compose.yml
Replace inline server with:
- Multi-stage build or volume-mounted server code
- Install npm dependencies from server/package.json
- Mount /Users/nora/.openclaw-backups:/backups:ro
- Environment: NODE_ENV=production, PORT=3000

### 4. Add New Routes (Optional but good)
- GET /api/cron-status - Live cron data
- GET /api/backup-status - Live backup data  
- GET /api/docker-status - Query Portainer for container status

## Testing Steps
1. Build and run locally: `docker-compose up --build`
2. Test endpoints: 
   - curl http://localhost:8081/api/cron-status
   - curl http://localhost:8081/api/backup-status
3. Verify data is live (not hardcoded)

## Deployment
After testing, commit to git and deploy to Portainer:
- Stack: clara-dashboard
- Endpoint: docker02 (ID: 4)
- URL: http://192.168.5.82:8081

## Success Criteria
- [ ] /api/cron-status returns actual OpenClaw cron jobs (10+ jobs, not 6)
- [ ] /api/backup-status returns today's backup date (2026-02-11), not Feb 10
- [ ] Dashboard displays live data that updates when cron jobs change
- [ ] Deployed and running on docker02
