import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let containers = [];

    try {
      // Try to get actual Docker container status
      // This would need SSH access to docker02 or Docker API access
      const dockerHost = process.env.DOCKER_HOST || 'docker02';

      // Attempt to get containers via SSH (adjust command based on your setup)
      // const { stdout } = await execAsync(`ssh ${dockerHost} "docker ps --format '{{json .}}'"`, { timeout: 5000 });
      // containers = stdout.split('\n').filter(l => l).map(l => JSON.parse(l));

      // For now, use mock data
      throw new Error('Using mock data');
    } catch (error) {
      // Use mock data if Docker command fails
      containers = [
        {
          id: 'abc123def456',
          name: 'clara-api',
          image: 'clara-api:latest',
          status: 'running',
          uptime: '3 days',
          ports: '3000:3000'
        },
        {
          id: 'def456ghi789',
          name: 'postgres-db',
          image: 'postgres:15',
          status: 'running',
          uptime: '7 days',
          ports: '5432:5432'
        },
        {
          id: 'ghi789jkl012',
          name: 'redis-cache',
          image: 'redis:7',
          status: 'running',
          uptime: '7 days',
          ports: '6379:6379'
        }
      ];
    }

    const stats = {
      total: containers.length,
      running: containers.filter(c => c.status === 'running').length,
      stopped: containers.filter(c => c.status !== 'running').length
    };

    res.json({
      success: true,
      data: {
        host: process.env.DOCKER_HOST || 'docker02',
        containers,
        stats
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
