# Clara Dashboard - Frontend

A simple React dashboard for monitoring system health, backups, cron jobs, and Docker containers.

## Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build
```

The development server proxies API requests to `http://localhost:3001`.

## Docker Production Build

```bash
# Build the Docker image
docker build -t clara-dashboard-client .

# Run the container
docker run -p 80:80 clara-dashboard-client
```

The production build is served by nginx and proxies `/api/*` requests to the backend service (configured as `backend:3001` in nginx.conf).

## Features

- Real-time dashboard with 4 monitoring cards:
  - System Health (CPU, Memory, Uptime)
  - Backup Status
  - Cron Jobs
  - Docker Containers
- Auto-refresh every 30 seconds
- Manual refresh button
- Color-coded status indicators (green/orange/red)
- Responsive design for mobile and desktop
- Production-ready Docker setup with nginx
- Optimized build with Vite

## API Endpoints

The frontend expects these backend endpoints:
- `GET /api/health` - System health information
- `GET /api/backup-status` - Backup status
- `GET /api/cron-status` - Cron job information
