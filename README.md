# Clara Dashboard

A web dashboard for monitoring Clara's system health, backups, cron jobs, and Docker containers.

## Features

- **System Health** - CPU, Memory, Uptime status
- **Backup Status** - Latest backup information
- **Cron Jobs** - Scheduled task monitoring
- **Docker Status** - Container health from docker02

## Quick Start

### Local Development

```bash
# Start backend
cd server
npm install
npm start

# In another terminal, start frontend
cd client
npm install
npm run dev
```

### Production Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d
```

Access at http://localhost:8081

## API Endpoints

- `GET /api/health` - System health status
- `GET /api/backup-status` - Backup information
- `GET /api/cron-status` - Cron job status
- `GET /api/docker-status` - Docker container status (mock)

## Deployment to docker02

```bash
# Push to GitHub, then deploy via Portainer
./portainer.sh create clara-dashboard https://github.com/dhannifin/clara-dashboard docker-compose.yml 4
```
