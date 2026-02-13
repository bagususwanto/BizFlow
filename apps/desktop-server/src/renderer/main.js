let serverStatus = null;
let startTime = Date.now();
let uptimeInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Setup event listeners
  setupEventListeners();

  // Load initial status
  await loadServerStatus();

  // Listen for server status updates
  window.electronAPI?.on.serverStatus((status) => {
    serverStatus = status;
    updateUI(status);
  });
});

async function loadServerStatus() {
  try {
    serverStatus = await window.electronAPI.server.getStatus();
    updateUI(serverStatus);
  } catch (error) {
    console.error('Failed to load server status:', error);
  }
}

function updateUI(status) {
  if (!status) return;

  // Update status indicator
  const statusText = document.getElementById('status-text');
  const statusDot = document.querySelector('.status-dot');

  const isRunning = status.api === 'running' && status.web === 'running';

  if (isRunning) {
    statusText.textContent = 'Running';
    statusDot.className = 'status-dot running';

    // Update button to Stop
    const actionBtn = document.getElementById('stop-btn');
    actionBtn.textContent = 'Stop Server';
    actionBtn.className = 'btn btn-destructive';
    actionBtn.onclick = handleStopServer;
  } else {
    statusText.textContent = 'Stopped';
    statusDot.className = 'status-dot stopped';

    // Update button to Start
    const actionBtn = document.getElementById('stop-btn');
    actionBtn.textContent = 'Start Server';
    actionBtn.className = 'btn btn-success'; // Need to add this class in CSS
    actionBtn.onclick = handleStartServer;
  }

  // Update URLs
  document.getElementById('local-url').textContent = status.webUrl;

  // Get network IP (simplified - just show localhost for now)
  const networkUrl = status.webUrl.replace('localhost', getLocalIP());
  document.getElementById('network-url').textContent = networkUrl;
}

function getLocalIP() {
  // Simplified - in real app, we'd get actual network IP
  return '192.168.1.10';
}

function startUptimeCounter() {
  updateUptime();
  uptimeInterval = setInterval(updateUptime, 60000); // Update every minute
}

function updateUptime() {
  const now = Date.now();
  const diff = now - startTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  let uptimeText = '';
  if (hours > 0) {
    uptimeText = `${hours} jam ${minutes % 60} menit`;
  } else {
    uptimeText = `${minutes} menit`;
  }

  document.getElementById('uptime').textContent = uptimeText;
}

function setupEventListeners() {
  // Open in browser
  document
    .getElementById('open-browser')
    .addEventListener('click', async () => {
      if (serverStatus) {
        await window.electronAPI.app.openBrowser(serverStatus.webUrl);
      }
    });

  // Stop server
  // Initial button setup (will be overridden by updateUI)
  const actionBtn = document.getElementById('stop-btn');
  actionBtn.onclick = handleStopServer;

  // Minimize to tray
  document.getElementById('minimize-btn').addEventListener('click', () => {
    window.close(); // This will hide to tray based on window config
  });

  // Navigation buttons
  document.getElementById('logs-btn').addEventListener('click', async () => {
    await window.electronAPI.app.openLogs();
  });

  document.getElementById('backup-btn').addEventListener('click', async () => {
    if (confirm('Create a new backup now?')) {
      try {
        const result = await window.electronAPI.backup.create();
        if (result.success) {
          alert('Backup created successfully!');
        } else {
          alert('Backup failed: ' + result.error);
        }
      } catch (error) {
        alert('Backup failed: ' + error.message);
      }
    }
  });

  document
    .getElementById('settings-btn')
    .addEventListener('click', async () => {
      await window.electronAPI.app.openSettings();
    });
}

async function handleStopServer() {
  if (confirm('Apakah Anda yakin ingin menghentikan server?')) {
    try {
      await window.electronAPI.server.stop();
      // Status update will come via event listener
    } catch (error) {
      alert('Gagal menghentikan server: ' + error.message);
    }
  }
}

async function handleStartServer() {
  try {
    const actionBtn = document.getElementById('stop-btn');
    actionBtn.textContent = 'Starting...';
    actionBtn.disabled = true;

    await window.electronAPI.server.start();
    // Status update will come via event listener

    actionBtn.disabled = false;
  } catch (error) {
    alert('Gagal memulai server: ' + error.message);
    document.getElementById('stop-btn').disabled = false;
  }
}
