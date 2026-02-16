// License activation UI logic
const activationForm = document.getElementById('activation-form');
const licenseInfo = document.getElementById('license-info');
const licenseKeyInput = document.getElementById('license-key');
const deviceIdEl = document.getElementById('device-id');
const activateBtn = document.getElementById('activate-btn');
const deactivateBtn = document.getElementById('deactivate-btn');
const messageEl = document.getElementById('message');

// Format license key input (auto-add dashes)
licenseKeyInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/[^A-Z0-9-]/gi, '').toUpperCase();
  e.target.value = value;
});

// Copy Device ID
const copyBtn = document.getElementById('copy-btn');
copyBtn.addEventListener('click', () => {
  const deviceId = deviceIdEl.textContent;
  if (deviceId && deviceId !== 'Loading...') {
    navigator.clipboard.writeText(deviceId);

    // Visual feedback
    const originalContent = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span style="font-size: 12px">Copied!</span>';
    setTimeout(() => {
      copyBtn.innerHTML = originalContent;
    }, 2000);
  }
});

// Theme handling
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.style.setProperty('--bg-primary', isDark ? '#1a1b1e' : '#ffffff');
    root.style.setProperty('--bg-secondary', isDark ? '#25262b' : '#f8f9fa');
    root.style.setProperty('--text-primary', isDark ? '#e6e6e6' : '#1f2937');
    root.style.setProperty('--text-secondary', isDark ? '#909296' : '#6b7280');
    root.style.setProperty('--border-color', isDark ? '#373a40' : '#e5e7eb');
    root.style.setProperty('--bg-tertiary', isDark ? '#2C2E33' : '#f1f3f5');
    root.style.setProperty('--bg-hover', isDark ? '#373A40' : '#e9ecef');
  } else if (theme === 'light') {
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f8f9fa');
    root.style.setProperty('--text-primary', '#1f2937');
    root.style.setProperty('--text-secondary', '#6b7280');
    root.style.setProperty('--border-color', '#e5e7eb');
    root.style.setProperty('--bg-tertiary', '#f1f3f5');
    root.style.setProperty('--bg-hover', '#e9ecef');
  } else {
    // Dark theme (default) - Remove overrides to use CSS defaults
    root.style.removeProperty('--bg-primary');
    root.style.removeProperty('--bg-secondary');
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--border-color');
    root.style.removeProperty('--bg-tertiary');
    root.style.removeProperty('--bg-hover');
  }
}

// Load device ID, license status, and config
async function initialize() {
  try {
    // Load Config (Theme & Language)
    const config = await window.electronAPI.config.get();
    applyTheme(config.theme);
    if (window.i18n) {
      window.i18n.applyTranslations(config.language || 'id');
    }

    // Listen for changes
    window.electronAPI.on.themeUpdate((theme) => applyTheme(theme));
    window.electronAPI.on.languageUpdate((lang) => {
      if (window.i18n) window.i18n.applyTranslations(lang);
    });

    // Load License Data
    const deviceId = await window.electronAPI.license.getDeviceId();
    deviceIdEl.textContent = deviceId;

    const status = await window.electronAPI.license.getStatus();
    const info = await window.electronAPI.license.getInfo();

    if (status === 'active' && info) {
      showLicenseInfo(info);
    } else if (status === 'expired') {
      showMessage(
        window.i18n ? window.i18n.t('msg.expired') : 'License has expired',
        'error',
      );
    } else if (status === 'invalid') {
      showMessage(
        window.i18n ? window.i18n.t('msg.invalid') : 'License is invalid',
        'error',
      );
    }
  } catch (error) {
    console.error('Failed to initialize license window:', error);
  }
}

// Show message
function showMessage(text, type = 'success') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

// Show license info
function showLicenseInfo(info) {
  activationForm.style.display = 'none';
  licenseInfo.style.display = 'block';

  document.getElementById('info-activated').textContent = new Date(
    info.activatedAt,
  ).toLocaleDateString();
  document.getElementById('info-expires').textContent = info.expiresAt
    ? new Date(info.expiresAt).toLocaleDateString()
    : 'Lifetime';

  const statusEl = document.getElementById('info-status');
  if (info.isValid) {
    statusEl.textContent = 'Active';
    statusEl.style.color = 'var(--accent-success)';
  } else {
    statusEl.textContent = 'Invalid';
    statusEl.style.color = 'var(--accent-danger)';
  }
}

// Activate license
activateBtn.addEventListener('click', async () => {
  const licenseKey = licenseKeyInput.value; // Changed from licenseInput to licenseKeyInput

  if (!licenseKey) {
    showMessage('Please fill in the license key', 'error');
    return;
  }

  activateBtn.disabled = true;
  showMessage('Activating...', 'info');

  try {
    const result = await window.electronAPI.license.activate(licenseKey); // Changed invoke to license.activate

    if (result.success) {
      showMessage(result.message, 'success');

      // Reload status
      const info = await window.electronAPI.license.getInfo(); // Changed invoke to license.getInfo
      showLicenseInfo(info); // Changed showActiveState to showLicenseInfo
    } else {
      showMessage(result.message, 'error');
      activateBtn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    showMessage('Activation failed: ' + error.message, 'error');
    activateBtn.disabled = false;
  } finally {
    // Added finally block to ensure button state reset
    activateBtn.textContent = 'Activate License';
  }
});

// Deactivation Proof Copy
const proofCodeEl = document.getElementById('proof-code');
const copyProofBtn = document.getElementById('copy-proof-btn');
const deactivationProofEl = document.getElementById('deactivation-proof');

if (copyProofBtn) {
  copyProofBtn.addEventListener('click', () => {
    const proof = proofCodeEl.textContent;
    if (proof) {
      navigator.clipboard.writeText(proof);

      const originalContent = copyProofBtn.innerHTML;
      copyProofBtn.innerHTML = '<span style="font-size: 12px">Copied!</span>';
      setTimeout(() => {
        copyProofBtn.innerHTML = originalContent;
      }, 2000);
    }
  });
}

// Deactivate license
deactivateBtn.addEventListener('click', async () => {
  if (
    !confirm(
      'Are you sure you want to deactivate this license?\n\nThis will remove the license from this computer and generate a proof code.',
    )
  ) {
    return;
  }

  try {
    const result = await window.electronAPI.license.deactivate();

    if (result.success) {
      licenseInfo.style.display = 'none';
      activationForm.style.display = 'block';
      licenseKeyInput.value = '';

      // Show Deactivation Proof if available
      if (result.proof) {
        deactivationProofEl.style.display = 'block';
        proofCodeEl.textContent = result.proof;
        showMessage(
          'License deactivated. Please save the proof code below.',
          'success',
        );
      } else {
        showMessage('License deactivated successfully', 'success');
      }
    } else {
      showMessage(
        'Deactivation failed: ' + (result.message || 'Unknown error'),
        'error',
      );
    }
  } catch (error) {
    console.error(error);
    showMessage('Deactivation failed: ' + error.message, 'error');
  }
});

// Initialize
initialize();
