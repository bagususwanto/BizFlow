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

  // Theme handling
  window.electronAPI.on.themeUpdate((theme) => applyTheme(theme));

  // Language handling
  window.electronAPI.on.languageUpdate((lang) => {
    window.i18n.applyTranslations(lang);
  });

  // Apply initial theme and language
  const config = await window.electronAPI.config.get();
  applyTheme(config.theme);

  if (window.i18n) {
    window.i18n.applyTranslations(config.language || 'id');
  }
});

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.style.setProperty('--bg-color', isDark ? '#1a1b1e' : '#ffffff');
    root.style.setProperty('--card-bg', isDark ? '#25262b' : '#f8f9fa');
    root.style.setProperty('--text-primary', isDark ? '#e6e6e6' : '#1f2937');
    root.style.setProperty('--text-secondary', isDark ? '#909296' : '#6b7280');
    root.style.setProperty('--border-color', isDark ? '#373a40' : '#e5e7eb');
  } else if (theme === 'light') {
    root.style.setProperty('--bg-color', '#ffffff');
    root.style.setProperty('--card-bg', '#f8f9fa');
    root.style.setProperty('--text-primary', '#1f2937');
    root.style.setProperty('--text-secondary', '#6b7280');
    root.style.setProperty('--border-color', '#e5e7eb');
  } else {
    // Dark theme (default)
    root.style.removeProperty('--bg-color');
    root.style.removeProperty('--card-bg');
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--border-color');
  }
}

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
  const t = window.i18n ? window.i18n.t : (k) => k;
  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = t('btn.saving');

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
      showMessage('success', t('msg.settingsSaved'));
    } else {
      showMessage('error', t('msg.saveFailed'));
    }
  } catch (error) {
    console.error('Failed to save config:', error);
    showMessage('error', error.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = t('btn.save');
  }
}

// License Management
async function loadLicenseInfo() {
  const t = window.i18n ? window.i18n.t : (k) => k;
  try {
    const deviceId = await window.electronAPI.license.getDeviceId();
    document.getElementById('device-id').textContent = deviceId;

    const status = await window.electronAPI.license.getStatus();
    const info = await window.electronAPI.license.getInfo();

    if (status === 'active') {
      document.getElementById('license-form').style.display = 'none';
      document.getElementById('license-active-view').style.display = 'block';

      document.getElementById('info-expires').textContent =
        info.expires || t('never');
    } else {
      document.getElementById('license-form').style.display = 'block';
      document.getElementById('license-active-view').style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to load license info:', error);
  }
}

async function activateLicense() {
  const t = window.i18n ? window.i18n.t : (k) => k;
  const btn = document.getElementById('activate-btn');
  const key = document.getElementById('licenseKey').value;

  if (!key) {
    showMessage('error', t('msg.fillFields'));
    return;
  }

  btn.disabled = true;
  btn.textContent = t('btn.activating');

  try {
    const result = await window.electronAPI.license.activate(key);

    if (result.success) {
      showMessage('success', t('msg.activationSuccess'));
      await loadLicenseInfo();
    } else {
      showMessage('error', result.error || t('msg.activationFailed'));
    }
  } catch (error) {
    showMessage('error', error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = t('btn.activate');
  }
}

async function deactivateLicense() {
  const t = window.i18n ? window.i18n.t : (k) => k;
  if (!confirm(t('confirm.deactivate'))) return;

  const btn = document.getElementById('deactivate-btn');
  btn.disabled = true;
  btn.textContent = t('btn.deactivating');

  try {
    await window.electronAPI.license.deactivate();
    showMessage('success', t('msg.deactivated'));

    // Reset form
    document.getElementById('licenseKey').value = '';

    await loadLicenseInfo();
  } catch (error) {
    showMessage('error', 'Deactivation failed: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = t('btn.deactivate');
  }
}
