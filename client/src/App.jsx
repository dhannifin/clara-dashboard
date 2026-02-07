import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);
  const [backupStatus, setBackupStatus] = useState(null);
  const [cronStatus, setCronStatus] = useState(null);
  const [dockerStatus, setDockerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthRes, backupRes, cronRes] = await Promise.all([
        fetch('/api/health').then(r => r.json()).catch(() => ({ status: 'error', message: 'Failed to fetch' })),
        fetch('/api/backup-status').then(r => r.json()).catch(() => ({ status: 'error', message: 'Failed to fetch' })),
        fetch('/api/cron-status').then(r => r.json()).catch(() => ({ status: 'error', message: 'Failed to fetch' }))
      ]);

      setHealth(healthRes);
      setBackupStatus(backupRes);
      setCronStatus(cronRes);

      // Docker status from health endpoint
      setDockerStatus({
        status: healthRes.docker?.status || 'unknown',
        containers: healthRes.docker?.containers || []
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'gray';
    const statusLower = status.toLowerCase();
    if (statusLower === 'healthy' || statusLower === 'running' || statusLower === 'ok') return 'green';
    if (statusLower === 'warning') return 'orange';
    return 'red';
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Clara Dashboard</h1>
        <button onClick={fetchData} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="dashboard">
        <div className="card">
          <div className="card-header">
            <h2>System Health</h2>
            <span className={`status-indicator ${getStatusColor(health?.status)}`}></span>
          </div>
          <div className="card-body">
            {loading && !health ? (
              <p>Loading...</p>
            ) : (
              <>
                <p><strong>Status:</strong> {health?.status || 'Unknown'}</p>
                <p><strong>Uptime:</strong> {health?.uptime || 'N/A'}</p>
                <p><strong>Memory:</strong> {health?.memory || 'N/A'}</p>
                <p><strong>CPU:</strong> {health?.cpu || 'N/A'}</p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Backup Status</h2>
            <span className={`status-indicator ${getStatusColor(backupStatus?.status)}`}></span>
          </div>
          <div className="card-body">
            {loading && !backupStatus ? (
              <p>Loading...</p>
            ) : (
              <>
                <p><strong>Status:</strong> {backupStatus?.status || 'Unknown'}</p>
                <p><strong>Last Backup:</strong> {backupStatus?.lastBackup || 'N/A'}</p>
                <p><strong>Next Scheduled:</strong> {backupStatus?.nextBackup || 'N/A'}</p>
                <p><strong>Backup Size:</strong> {backupStatus?.size || 'N/A'}</p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Cron Jobs</h2>
            <span className={`status-indicator ${getStatusColor(cronStatus?.status)}`}></span>
          </div>
          <div className="card-body">
            {loading && !cronStatus ? (
              <p>Loading...</p>
            ) : (
              <>
                <p><strong>Status:</strong> {cronStatus?.status || 'Unknown'}</p>
                <p><strong>Active Jobs:</strong> {cronStatus?.activeJobs || 0}</p>
                <p><strong>Last Run:</strong> {cronStatus?.lastRun || 'N/A'}</p>
                {cronStatus?.jobs && cronStatus.jobs.length > 0 && (
                  <ul className="job-list">
                    {cronStatus.jobs.map((job, idx) => (
                      <li key={idx}>{job}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Docker Status</h2>
            <span className={`status-indicator ${getStatusColor(dockerStatus?.status)}`}></span>
          </div>
          <div className="card-body">
            {loading && !dockerStatus ? (
              <p>Loading...</p>
            ) : (
              <>
                <p><strong>Status:</strong> {dockerStatus?.status || 'Unknown'}</p>
                <p><strong>Containers:</strong> {dockerStatus?.containers?.length || 0}</p>
                {dockerStatus?.containers && dockerStatus.containers.length > 0 && (
                  <ul className="job-list">
                    {dockerStatus.containers.map((container, idx) => (
                      <li key={idx}>{container}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
