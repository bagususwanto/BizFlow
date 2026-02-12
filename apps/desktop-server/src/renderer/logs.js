// Logs viewer UI logic

let allLogs = [];
let filteredLogs = [];
let autoScroll = true;

// DOM elements
const logsContainer = document.getElementById('logs-container');
const logsList = document.getElementById('logs-list');
const logsEmpty = document.getElementById('logs-empty');
const logCount = document.getElementById('log-count');
const logFilePath = document.getElementById('log-file-path');
const levelFilter = document.getElementById('level-filter');
const sourceFilter = document.getElementById('source-filter');
const searchInput = document.getElementById('search-input');
const autoScrollCheckbox = document.getElementById('auto-scroll');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');
const openFileBtn = document.getElementById('open-file-btn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadLogs();
  await loadLogFilePath();

  // Listen for real-time log updates
  window.electronAPI?.on.logUpdate((log) => {
    addLogToUI(log);
  });
});

function setupEventListeners() {
  levelFilter.addEventListener('change', applyFilters);
  sourceFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
  autoScrollCheckbox.addEventListener('change', (e) => {
    autoScroll = e.target.checked;
  });

  clearBtn.addEventListener('click', handleClearLogs);
  exportBtn.addEventListener('click', handleExportLogs);
  openFileBtn.addEventListener('click', handleOpenFile);
}

async function loadLogs() {
  try {
    const logs = await window.electronAPI.logs.getAll();
    allLogs = logs;
    applyFilters();
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
}

async function loadLogFilePath() {
  try {
    const path = await window.electronAPI.logs.getFilePath();
    logFilePath.textContent = `File: ${path}`;
  } catch (error) {
    console.error('Failed to get log file path:', error);
  }
}

function applyFilters() {
  const level = levelFilter.value;
  const source = sourceFilter.value;
  const search = searchInput.value.trim();

  filteredLogs = allLogs.filter((log) => {
    if (level !== 'ALL' && log.level !== level) return false;
    if (source !== 'ALL' && log.source !== source) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  renderLogs();
}

function renderLogs() {
  if (filteredLogs.length === 0) {
    logsEmpty.style.display = 'flex';
    logsList.innerHTML = '';
  } else {
    logsEmpty.style.display = 'none';
    logsList.innerHTML = filteredLogs.map(createLogEntryHTML).join('');
  }

  logCount.textContent = `${filteredLogs.length} logs`;

  if (autoScroll) {
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }
}

function createLogEntryHTML(log) {
  const timestamp = new Date(log.timestamp).toLocaleString('id-ID');
  return `
    <div class="log-entry">
      <span class="log-timestamp">${timestamp}</span>
      <span class="log-level ${log.level}">${log.level}</span>
      <span class="log-source ${log.source}">${log.source}</span>
      <span class="log-message">${escapeHtml(log.message)}</span>
    </div>
  `;
}

function addLogToUI(log) {
  allLogs.push(log);

  // Check if log passes current filters
  const level = levelFilter.value;
  const source = sourceFilter.value;
  const search = searchInput.value.trim();

  let passesFilter = true;
  if (level !== 'ALL' && log.level !== level) passesFilter = false;
  if (source !== 'ALL' && log.source !== source) passesFilter = false;
  if (search && !log.message.toLowerCase().includes(search.toLowerCase()))
    passesFilter = false;

  if (passesFilter) {
    filteredLogs.push(log);
    logsEmpty.style.display = 'none';

    const logHTML = createLogEntryHTML(log);
    logsList.insertAdjacentHTML('beforeend', logHTML);

    logCount.textContent = `${filteredLogs.length} logs`;

    if (autoScroll) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  }
}

async function handleClearLogs() {
  if (confirm('Apakah Anda yakin ingin menghapus semua logs dari memori?')) {
    try {
      await window.electronAPI.logs.clear();
      allLogs = [];
      filteredLogs = [];
      renderLogs();
    } catch (error) {
      alert('Gagal menghapus logs: ' + error.message);
    }
  }
}

async function handleExportLogs() {
  try {
    const result = await window.electronAPI.logs.export();
    if (result.success) {
      alert(`Logs berhasil di-export ke:\n${result.path}`);
    }
  } catch (error) {
    alert('Gagal export logs: ' + error.message);
  }
}

async function handleOpenFile() {
  try {
    await window.electronAPI.logs.openFile();
  } catch (error) {
    alert('Gagal membuka file log: ' + error.message);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
