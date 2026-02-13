let serverStatus = null;
let startTime = Date.now();
let uptimeInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Setup event listeners
  setupEventListeners();

  // Listen for theme updates
  window.electronAPI?.on.themeUpdate((theme) => applyTheme(theme));

  // Apply initial theme
  try {
    const config = await window.electronAPI.config.get();
    applyTheme(config.theme);
  } catch (err) {
    console.error('Failed to load theme:', err);
  }

  // Load initial status
  await loadServerStatus();

  // Listen for server status updates
  window.electronAPI?.on.serverStatus((status) => {
    serverStatus = status;
    updateUI(status);
  });

  if (serverStatus) updateUI(serverStatus);
});

function applyTheme(theme) {
  const root = document.documentElement;
  document.documentElement.setAttribute('data-theme', theme);

  const colors = {
    dark: {
      background: '#1a1b1e',
      foreground: '#e6e6e6',
      card: '#25262b',
      cardForeground: '#e6e6e6',
      primary: '#3b82f6', // Bright blue for dark mode
      primaryForeground: '#ffffff',
      secondary: '#2c2e33',
      secondaryForeground: '#e6e6e6',
      muted: '#2c2e33',
      mutedForeground: '#909296',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#373a40',
      success: '#22c55e',
      successForeground: '#ffffff',
    },
    light: {
      background: '#ffffff',
      foreground: '#1f2937',
      card: '#f8f9fa',
      cardForeground: '#1f2937',
      primary: '#2563eb', // Standard blue
      primaryForeground: '#ffffff',
      secondary: '#f3f4f6',
      secondaryForeground: '#1f2937',
      muted: '#f3f4f6',
      mutedForeground: '#6b7280',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e5e7eb',
      success: '#16a34a',
      successForeground: '#ffffff',
    },
  };

  const setVariables = (mode) => {
    const palette = colors[mode];
    root.style.setProperty('--background', palette.background);
    root.style.setProperty('--foreground', palette.foreground);
    root.style.setProperty('--card', palette.card);
    root.style.setProperty('--card-foreground', palette.cardForeground);
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-foreground', palette.primaryForeground);
    root.style.setProperty('--secondary', palette.secondary);
    root.style.setProperty(
      '--secondary-foreground',
      palette.secondaryForeground,
    );
    root.style.setProperty('--muted', palette.muted);
    root.style.setProperty('--muted-foreground', palette.mutedForeground);
    root.style.setProperty('--destructive', palette.destructive);
    root.style.setProperty(
      '--destructive-foreground',
      palette.destructiveForeground,
    );
    root.style.setProperty('--border', palette.border);
    root.style.setProperty('--success', palette.success);
    root.style.setProperty('--success-foreground', palette.successForeground);

    // Keep internal variables for backward compatibility
    root.style.setProperty('--bg-color', palette.background);
    root.style.setProperty('--card-bg', palette.card);
  };

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setVariables(isDark ? 'dark' : 'light');
  } else if (theme === 'light') {
    setVariables('light');
  } else {
    setVariables('dark');
  }
}

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
      // IPC handle will show dialog
      await window.electronAPI.backup.create();
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
