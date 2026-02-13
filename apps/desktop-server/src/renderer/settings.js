document.addEventListener('DOMContentLoaded', async () => {
  // Tab switching
  setupTabs();

  // Load initial data
  await loadConfig();
  await loadLicenseInfo();

  // Button handlers
  document.getElementById('save-btn').addEventListener('click', saveConfig);
  document
    .getElementById('cancel-btn')
    .addEventListener('click', () => window.close());

  // License handlers
  document
    .getElementById('activate-btn')
    .addEventListener('click', activateLicense);
  document
    .getElementById('deactivate-btn')
    .addEventListener('click', deactivateLicense);
});

function setupTabs() {
  const tabs = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Remove active class from all
      tabs.forEach((t) => t.classList.remove('active'));
      sections.forEach((s) => s.classList.remove('active'));

      // Add active class to clicked
      tab.classList.add('active');
      const targetId = tab.dataset.target;
      document.getElementById(targetId).classList.add('active');

      // Hide save/cancel buttons for license tab
      const footer = document.querySelector('.footer-actions');
      if (targetId === 'license') {
        footer.style.display = 'none';
      } else {
        footer.style.display = 'flex';
      }
    });
  });
}

function showMessage(type, text) {
  const container = document.getElementById('message-container');
  container.className = `message ${type}`;
  container.textContent = text;
  container.style.display = 'block';

  setTimeout(() => {
    container.style.display = 'none';
  }, 3000);
}

// Config Management
async function loadConfig() {
  try {
    const config = await window.electronAPI.config.get();

    // General
    document.getElementById('language').value = config.language || 'id';
    document.getElementById('theme').value = config.theme || 'system';
    document.getElementById('autoStart').checked = config.autoStart || false;
    document.getElementById('startMinimized').checked =
      config.startMinimized || false;
    document.getElementById('minimizeToTray').checked =
      config.minimizeToTray !== false;

    // Network
    document.getElementById('apiPort').value = config.apiPort || 3000;
    document.getElementById('webPort').value = config.webPort || 3001;

    // Backup
    document.getElementById('autoBackup').checked = config.autoBackup || false;
    document.getElementById('backupInterval').value =
      config.backupInterval || 24;
    document.getElementById('backupRetention').value =
      config.backupRetention || 7;
  } catch (error) {
    console.error('Failed to load config:', error);
    showMessage('error', 'Failed to load configuration');
  }
}

async function saveConfig() {
  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const updates = {
      // General
      language: document.getElementById('language').value,
      theme: document.getElementById('theme').value,
      autoStart: document.getElementById('autoStart').checked,
      startMinimized: document.getElementById('startMinimized').checked,
      minimizeToTray: document.getElementById('minimizeToTray').checked,

      // Network
      apiPort: parseInt(document.getElementById('apiPort').value),
      webPort: parseInt(document.getElementById('webPort').value),

      // Backup
      autoBackup: document.getElementById('autoBackup').checked,
      backupInterval: parseInt(document.getElementById('backupInterval').value),
      backupRetention: parseInt(
        document.getElementById('backupRetention').value,
      ),
    };

    const result = await window.electronAPI.config.update(updates);

    if (result.success) {
      showMessage(
        'success',
        'Settings saved successfully. Some changes may require restart.',
      );
    } else {
      showMessage('error', 'Failed to save settings');
    }
  } catch (error) {
    console.error('Failed to save config:', error);
    showMessage('error', error.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

// License Management
async function loadLicenseInfo() {
  try {
    const deviceId = await window.electronAPI.license.getDeviceId();
    document.getElementById('device-id').textContent = deviceId;

    const status = await window.electronAPI.license.getStatus();
    const info = await window.electronAPI.license.getInfo();

    if (status.active) {
      document.getElementById('license-form').style.display = 'none';
      document.getElementById('license-active-view').style.display = 'block';

      document.getElementById('info-key').textContent = info.key;
      document.getElementById('info-email').textContent = info.email;
      document.getElementById('info-expires').textContent =
        info.expires || 'Never';
    } else {
      document.getElementById('license-form').style.display = 'block';
      document.getElementById('license-active-view').style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to load license info:', error);
  }
}

async function activateLicense() {
  const btn = document.getElementById('activate-btn');
  const key = document.getElementById('licenseKey').value;
  const email = document.getElementById('email').value;

  if (!key || !email) {
    showMessage('error', 'Please fill in all fields');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Activating...';

  try {
    const result = await window.electronAPI.license.activate(key, email);

    if (result.success) {
      showMessage('success', 'License activated successfully');
      await loadLicenseInfo();
    } else {
      showMessage('error', result.error || 'Activation failed');
    }
  } catch (error) {
    showMessage('error', error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Activate License';
  }
}

async function deactivateLicense() {
  if (!confirm('Are you sure you want to deactivate this license?')) return;

  const btn = document.getElementById('deactivate-btn');
  btn.disabled = true;
  btn.textContent = 'Deactivating...';

  try {
    await window.electronAPI.license.deactivate();
    showMessage('success', 'License deactivated');

    // Reset form
    document.getElementById('licenseKey').value = '';
    document.getElementById('email').value = '';

    await loadLicenseInfo();
  } catch (error) {
    showMessage('error', 'Deactivation failed: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Deactivate License';
  }
}
