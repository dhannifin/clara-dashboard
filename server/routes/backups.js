import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// GET /api/backup-status - Live backup data
router.get('/backup-status', async (req, res) => {
  try {
    // Use the mounted volume path in container
    const backupDir = '/backups';

    let backupInfo = {
      status: 'unknown',
      lastBackup: null,
      totalBackups: 0,
      totalSize: 0,
      totalSizeFormatted: '0 KB',
      recentBackups: []
    };

    try {
      // Check if directory exists
      try {
        await fs.access(backupDir);
      } catch {
        throw new Error(`Backup directory ${backupDir} not accessible`);
      }
      
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(f => f.endsWith('.tar.gz') || f.endsWith('.zip'));

      if (backupFiles.length === 0) {
        backupInfo.status = 'no-backups';
      } else {
        const fileStats = await Promise.all(
          backupFiles.map(async (file) => {
            try {
              const filePath = path.join(backupDir, file);
              const stats = await fs.stat(filePath);
              return {
                name: file,
                date: stats.mtime.toISOString(),
                dateFormatted: stats.mtime.toISOString().replace('T', ' ').substring(0, 16),
                size: stats.size,
                sizeFormatted: formatBytes(stats.size)
              };
            } catch (err) {
              return null;
            }
          })
        );

        // Filter out failed stats
        const validStats = fileStats.filter(s => s !== null);
        
        // Sort by date descending
        validStats.sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalSize = validStats.reduce((sum, f) => sum + f.size, 0);
        const lastBackup = validStats[0];

        backupInfo = {
          status: 'healthy',
          lastBackup: lastBackup?.dateFormatted || null,
          lastBackupRaw: lastBackup?.date || null,
          totalBackups: validStats.length,
          totalSize: totalSize,
          totalSizeFormatted: formatBytes(totalSize),
          recentBackups: validStats.slice(0, 5)
        };
      }
    } catch (error) {
      console.error('Backup read error:', error.message);
      backupInfo.status = 'error';
      backupInfo.error = error.message;
    }

    res.json(backupInfo);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// GET / - List all backups
router.get('/', async (req, res) => {
  try {
    const backupDir = '/backups';
    
    try {
      await fs.access(backupDir);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'Backup directory not found'
      });
    }
    
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.endsWith('.tar.gz') || f.endsWith('.zip'));
    
    const fileStats = await Promise.all(
      backupFiles.map(async (file) => {
        try {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            date: stats.mtime.toISOString(),
            size: stats.size,
            sizeFormatted: formatBytes(stats.size)
          };
        } catch (err) {
          return null;
        }
      })
    );
    
    const validStats = fileStats.filter(s => s !== null);
    validStats.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        total: validStats.length,
        backups: validStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;
