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

// Load device ID and license status
async function loadLicenseStatus() {
  try {
    const deviceId = await window.electronAPI.license.getDeviceId();
    deviceIdEl.textContent = deviceId;

    const status = await window.electronAPI.license.getStatus();
    const info = await window.electronAPI.license.getInfo();

    if (status === 'active' && info) {
      showLicenseInfo(info);
    } else if (status === 'expired') {
      showMessage(
        'License has expired. Please renew or activate a new license.',
        'error',
      );
    } else if (status === 'invalid') {
      showMessage(
        'License is invalid. Please activate a valid license.',
        'error',
      );
    }
  } catch (error) {
    console.error('Failed to load license status:', error);
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

  document.getElementById('info-key').textContent = info.key;
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

// Deactivate license
deactivateBtn.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to deactivate this license?')) {
    return;
  }

  try {
    await window.electronAPI.license.deactivate();
    licenseInfo.style.display = 'none';
    activationForm.style.display = 'block';
    licenseKeyInput.value = '';
    emailInput.value = '';
    showMessage('License deactivated successfully', 'success');
  } catch (error) {
    showMessage('Deactivation failed: ' + error.message, 'error');
  }
});

// Initialize
loadLicenseStatus();
