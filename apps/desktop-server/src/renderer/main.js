let serverStatus = null;
let startTime = Date.now();
let uptimeInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load initial status
  await loadServerStatus();

  // Start uptime counter
  startUptimeCounter();

  // Setup event listeners
  setupEventListeners();

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
  } else {
    statusText.textContent = 'Stopped';
    statusDot.className = 'status-dot stopped';
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
  document.getElementById('stop-btn').addEventListener('click', async () => {
    if (confirm('Apakah Anda yakin ingin menghentikan server?')) {
      try {
        await window.electronAPI.server.stop();
        await loadServerStatus();
      } catch (error) {
        alert('Gagal menghentikan server: ' + error.message);
      }
    }
  });

  // Minimize to tray
  document.getElementById('minimize-btn').addEventListener('click', () => {
    window.close(); // This will hide to tray based on window config
  });

  // Navigation buttons (placeholder for Phase 4, 5, 6)
  document.getElementById('logs-btn').addEventListener('click', () => {
    alert('Logs viewer akan diimplementasikan di Phase 4');
  });

  document.getElementById('backup-btn').addEventListener('click', () => {
    alert('Backup/Restore akan diimplementasikan di Phase 5');
  });

  document.getElementById('settings-btn').addEventListener('click', () => {
    alert('Settings akan diimplementasikan di Phase 6');
  });
}
