/**
 * Simple i18n module for BizFlow Desktop Server
 */

const translations = {
  en: {
    // General
    'app.title': 'BizFlow Server',
    'status.running': 'Running',
    'status.stopped': 'Stopped',
    'status.starting': 'Starting...',
    'status.stopping': 'Stopping...',

    // Server Access
    'access.local': 'Local Access:',
    'access.network': 'Network Access (WiFi):',

    // Actions
    'btn.openBrowser': 'Open in Browser',
    'btn.stopServer': 'Stop Server',
    'btn.startServer': 'Start Server',
    'btn.logs': 'Logs',
    'btn.backup': 'Backup Now',
    'btn.settings': 'Settings',
    'btn.minimize': 'Minimize',

    // Uptime
    'uptime.label': 'Uptime:',
    'uptime.minutes': 'minutes',
    'uptime.hour': 'hour',
    'uptime.hours': 'hours',

    // Settings - Nav
    'nav.general': 'General',
    'nav.network': 'Network',
    'nav.backup': 'Backup',
    'nav.license': 'License',

    // Settings - General
    'settings.general.title': 'General Settings',
    'label.language': 'Language',
    'label.theme': 'Theme',
    'theme.system': 'System Default',
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'label.autoStart': 'Auto-start Server',
    'desc.autoStart': 'Automatically start servers when app launches',
    'label.startMinimized': 'Start Minimized',
    'desc.startMinimized': 'Start application minimized to tray',
    'label.minimizeToTray': 'Minimize to Tray',
    'desc.minimizeToTray': 'Minimize to system tray instead of closing',

    // Settings - Network
    'settings.network.title': 'Network Settings',
    'label.apiPort': 'API Port',
    'label.webPort': 'Web App Port',

    // Settings - Backup
    'settings.backup.title': 'Backup Settings',
    'label.autoBackup': 'Automatic Backup',
    'desc.autoBackup': 'Periodically backup database',
    'label.backupInterval': 'Backup Interval (Hours)',
    'label.backupRetention': 'Backup Retention (Count)',
    'desc.backupRetention':
      'Number of backups to keep before deleting old ones',

    // Settings - License
    'settings.license.title': 'License Management',
    'label.licenseKey': 'License Key',
    'label.email': 'Email Address',
    'label.deviceId': 'Device ID',
    'label.status': 'Status',
    'label.expires': 'Expires',
    'status.active': 'Active',
    'btn.activate': 'Activate License',
    'btn.deactivate': 'Deactivate License',
    'btn.activating': 'Activating...',
    'btn.deactivating': 'Deactivating...',

    // Common
    'btn.save': 'Save Changes',
    'btn.saving': 'Saving...',
    'btn.cancel': 'Cancel',
    loading: 'Loading...',
    never: 'Never',
    'confirm.backup': 'Create a new backup now?',
    'confirm.stop': 'Are you sure you want to stop the server?',
    'confirm.deactivate': 'Are you sure you want to deactivate this license?',
    'msg.backupSuccess': 'Backup created successfully!',
    'msg.settingsSaved':
      'Settings saved successfully. Some changes may require restart.',
    'msg.saveFailed': 'Failed to save settings',
    'msg.fillFields': 'Please fill in all fields',
    'msg.activationSuccess': 'License activated successfully',
    'msg.activationFailed': 'Activation failed',
    'msg.deactivated': 'License deactivated',

    // License Screen Specific
    'license.title': 'License Activation',
    'license.subtitle': 'Activate your BizFlow Server license',
    'label.format': 'Format: BZFL-[MachineID]-[Signature]',
    'label.shareId':
      'Share this ID with the administrator to get your license key',
    'btn.copyId': 'Copy Device ID',
    'msg.copied': 'Copied!',
    'msg.expired': 'License has expired',
    'msg.invalid': 'License is invalid',
  },
  id: {
    // General
    'app.title': 'BizFlow Server',
    'status.running': 'Berjalan',
    'status.stopped': 'Berhenti',
    'status.starting': 'Memulai...',
    'status.stopping': 'Menghentikan...',

    // Server Access
    'access.local': 'Akses Lokal:',
    'access.network': 'Akses dari Perangkat Lain (WiFi):',

    // Actions
    'btn.openBrowser': 'Buka di Browser',
    'btn.stopServer': 'Matikan Server',
    'btn.startServer': 'Nyalakan Server',
    'btn.logs': 'Logs',
    'btn.backup': 'Backup Sekarang',
    'btn.settings': 'Pengaturan',
    'btn.minimize': 'Minimalkan',

    // Uptime
    'uptime.label': 'Waktu Operasional:',
    'uptime.minutes': 'menit',
    'uptime.hour': 'jam',
    'uptime.hours': 'jam',

    // Settings - Nav
    'nav.general': 'Umum',
    'nav.network': 'Jaringan',
    'nav.backup': 'Backup',
    'nav.license': 'Lisensi',

    // Settings - General
    'settings.general.title': 'Pengaturan Umum',
    'label.language': 'Bahasa',
    'label.theme': 'Tema',
    'theme.system': 'Sesuai Sistem',
    'theme.dark': 'Gelap',
    'theme.light': 'Terang',
    'label.autoStart': 'Mulai Otomatis',
    'desc.autoStart': 'Jalankan server saat aplikasi dibuka',
    'label.startMinimized': 'Mulai Diminimalkan',
    'desc.startMinimized': 'Jalankan aplikasi di system tray',
    'label.minimizeToTray': 'Minimalkan ke Tray',
    'desc.minimizeToTray': 'Masuk ke system tray saat ditutup',

    // Settings - Network
    'settings.network.title': 'Pengaturan Jaringan',
    'label.apiPort': 'Port API',
    'label.webPort': 'Port Web App',

    // Settings - Backup
    'settings.backup.title': 'Pengaturan Backup',
    'label.autoBackup': 'Backup Otomatis',
    'desc.autoBackup': 'Backup database secara berkala',
    'label.backupInterval': 'Interval Backup (Jam)',
    'label.backupRetention': 'Penyimpanan Backup (Jumlah)',
    'desc.backupRetention':
      'Jumlah backup yang disimpan sebelum menghapus yang lama',

    // Settings - License
    'settings.license.title': 'Manajemen Lisensi',
    'label.licenseKey': 'Kunci Lisensi',
    'label.email': 'Alamat Email',
    'label.deviceId': 'ID Perangkat',
    'label.status': 'Status',
    'label.expires': 'Berakhir',
    'status.active': 'Aktif',
    'btn.activate': 'Aktivasi Lisensi',
    'btn.deactivate': 'Nonaktifkan Lisensi',
    'btn.activating': 'Mengaktivasi...',
    'btn.deactivating': 'Menonaktifkan...',

    // Common
    'btn.save': 'Simpan Perubahan',
    'btn.saving': 'Menyimpan...',
    'btn.cancel': 'Batal',
    loading: 'Memuat...',
    never: 'Tidak pernah',
    'confirm.backup': 'Buat backup baru sekarang?',
    'confirm.stop': 'Apakah Anda yakin ingin menghentikan server?',
    'confirm.deactivate': 'Apakah Anda yakin ingin menonaktifkan lisensi ini?',
    'msg.backupSuccess': 'Backup berhasil dibuat!',
    'msg.settingsSaved':
      'Pengaturan berhasil disimpan. Beberapa perubahan mungkin memerlukan restart.',
    'msg.saveFailed': 'Gagal menyimpan pengaturan',
    'msg.fillFields': 'Mohon isi semua kolom',
    'msg.activationSuccess': 'Lisensi berhasil diaktifkan',
    'msg.activationFailed': 'Aktivasi gagal',
    'msg.deactivated': 'Lisensi dinonaktifkan',

    // License Screen Specific
    'license.title': 'Aktivasi Lisensi',
    'license.subtitle': 'Aktifkan lisensi BizFlow Server Anda',
    'label.format': 'Format: BZFL-[IDMesin]-[TandaTangan]',
    'label.shareId':
      'Bagikan ID ini ke administrator untuk mendapatkan kunci lisensi',
    'btn.copyId': 'Salin ID Perangkat',
    'msg.copied': 'Disalin!',
    'msg.expired': 'Lisensi telah berakhir',
    'msg.invalid': 'Lisensi tidak valid',
  },
};

let currentLang = 'id';

function applyTranslations(lang) {
  if (!translations[lang]) return;
  currentLang = lang;

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      // Handle inputs/placeholders
      if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
        el.setAttribute('placeholder', translations[lang][key]);
      } else {
        // Safe update for elements with icons
        // If element has icon children, we only want to update the text node
        const hasChildren = el.children.length > 0;

        if (hasChildren) {
          // Find text node and update it
          let textNode = null;
          for (let i = 0; i < el.childNodes.length; i++) {
            if (
              el.childNodes[i].nodeType === Node.TEXT_NODE &&
              el.childNodes[i].textContent.trim().length > 0
            ) {
              textNode = el.childNodes[i];
              break;
            }
          }

          if (textNode) {
            textNode.textContent = ' ' + translations[lang][key]; // Add space padding usually needed after icon
          } else {
            // Fallback: if no text node found but has children, maybe append text?
            // Ideally we shouldn't reach here if HTML is structured correctly
            // Let's assume the text is at the end
            el.append(' ' + translations[lang][key]);
          }
        } else {
          el.textContent = translations[lang][key];
        }
      }
    }
  });

  // Custom event for complex components to update themselves
  document.dispatchEvent(
    new CustomEvent('language-changed', { detail: { lang } }),
  );
}

function getTranslation(key) {
  return translations[currentLang][key] || key;
}

// Export for usage
window.i18n = {
  applyTranslations,
  getTranslation,
  getCurrentLang: () => currentLang,
  t: getTranslation, // shorthand
};
