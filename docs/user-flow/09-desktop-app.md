# Desktop App User Flow

Dokumentasi alur pengguna untuk aplikasi desktop BizFlow (Electron wrapper).

---

## 1. Startup Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                        STARTUP SEQUENCE                          │
└─────────────────────────────────────────────────────────────────┘

  [1] User double-click BizFlow.exe
                  │
                  ▼
  [2] Electron starts
      ├── Check if port 3000 available
      ├── If not, find next available port
      └── Show splash screen "Starting..."
                  │
                  ▼
  [3] Spawn NestJS server
      ├── Load environment config
      ├── Connect to SQLite (auto-create if not exists)
      ├── Run pending migrations (if any)
      └── Start listening on port 3000
                  │
                  ▼
  [4] Health check loop
      └── GET http://localhost:3000/health
          ├── If OK → proceed
          └── If fail → retry (max 10x, then show error)
                  │
                  ▼
  [5] Server ready!
      ├── Show main window dengan status & URL
      ├── Show notification "BizFlow siap digunakan"
      └── User bisa klik "Buka di Browser" atau minimize to tray
                  │
                  ▼
  [6] User klik "Buka di Browser"
      └── Open default browser → http://localhost:3000
                  │
                  ▼
  [7] User sees login page 🎉
```

---

## 2. Main Window

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🏪 BizFlow                              [─] [□] [×]   │
│  ═══════════════════════════════════════════════════   │
│                                                         │
│  Status: ● Running                                      │
│  Database: bizflow.db (24 MB)                           │
│  Uptime: 2 jam 15 menit                                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📍 Akses Lokal:                                │   │
│  │     http://localhost:3000                       │   │
│  │                                                 │   │
│  │  📡 Akses dari Device Lain (WiFi):              │   │
│  │     http://192.168.1.10:3000                    │   │
│  │                                                 │   │
│  │  Scan QR untuk akses dari HP:  [QR CODE]        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         [ 🌐 Buka di Browser ]                  │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 📋 Logs     │ │ 💾 Backup   │ │ ⚙️ Settings │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  [ Minimize to Tray ]              [ Stop Server ]      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. System Tray Menu

```
┌──────────────────────────┐
│ 🏪 BizFlow               │
├──────────────────────────┤
│ ● Server Running         │
├──────────────────────────┤
│ 🌐 Buka di Browser       │
│ 📋 Lihat Logs            │
│ 💾 Backup Sekarang       │
├──────────────────────────┤
│ ⏸️  Stop Server          │
│ 🔄 Restart Server        │
├──────────────────────────┤
│ ❌ Keluar                 │
└──────────────────────────┘
```

---

## 4. Logs Viewer

```
┌────────────────────────────────────────────────────────────────┐
│  📋 Application Logs                            [─] [□] [×]   │
├────────────────────────────────────────────────────────────────┤
│  Filter: [All ▾]  Level: [All ▾]     [ 🔍 Search... ]         │
├────────────────────────────────────────────────────────────────┤
│  [14:30:15] INFO   Server started on port 3000                 │
│  [14:30:15] INFO   Database connected: bizflow.db              │
│  [14:30:16] INFO   Migrations up to date                       │
│  [14:31:02] INFO   GET /api/products - 200 (45ms)              │
│  [14:31:05] INFO   POST /api/sales - 201 (120ms)               │
│  [14:31:10] WARN   Low disk space: 2GB remaining               │
│  [14:32:00] INFO   Auto-backup started                         │
│  [14:32:05] INFO   Backup completed: backup-2024-01-07.zip     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  [ Clear Logs ]  [ Export Logs ]  [ Buka File Log ]            │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Backup & Restore

```
┌──────────────────────────────────────────────────────────────┐
│  💾 Backup & Restore                            [─] [□] [×]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📤 BACKUP                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  [ 💾 Backup Sekarang ]                              │   │
│  │                                                      │   │
│  │  Terakhir backup: 07 Jan 2024, 14:32                 │   │
│  │  Ukuran: 24 MB                                       │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  📥 RESTORE                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pilih file backup untuk restore:                    │   │
│  │                                                      │   │
│  │  ○ backup-2024-01-07.zip (24 MB) - Hari ini 14:32    │   │
│  │  ○ backup-2024-01-06.zip (23 MB) - Kemarin 23:00     │   │
│  │  ○ backup-2024-01-05.zip (22 MB) - 2 hari lalu       │   │
│  │                                                      │   │
│  │  [ 📂 Pilih File Lain... ]                           │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ⚠️ Restore akan mengganti semua data saat ini!             │
│                                                              │
│                              [ Restore dari Backup ]         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Settings

```
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ Pengaturan Aplikasi                        [─] [□] [×]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔑 Lisensi                                                  │
│  ├─ Status: ✅ Aktif                                         │
│  ├─ License Key: BZFL-XXXX-XXXX-XXXX                         │
│  ├─ Terdaftar atas nama: Toko ABC                            │
│  ├─ Machine ID: 7F3A-9B2C-4D1E                               │
│  ├─ Berlaku sampai: 07 Jan 2025 (support & update)           │
│  └─ [ Ganti Lisensi ] [ Transfer ke Device Lain ]            │
│                                                              │
│  🌐 Server                                                   │
│  ├─ Port: [3000]                                             │
│  └─ Auto-start saat Windows: [✓]                             │
│                                                              │
│  💾 Backup                                                   │
│  ├─ Folder backup: [C:\BizFlow\backups]  [...]               │
│  ├─ Auto-backup: [✓] Setiap [1] hari                         │
│  └─ Simpan backup terakhir: [7] file                         │
│                                                              │
│  🎨 Tampilan                                                 │
│  ├─ Bahasa: [Indonesia ▾]                                    │
│  └─ Theme: [● Light ○ Dark ○ System]                         │
│                                                              │
│  📁 Data                                                     │
│  ├─ Lokasi database: C:\BizFlow\data\                        │
│  └─ [ Buka Folder Data ]                                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│              [ Simpan ]          [ Batal ]                   │
└──────────────────────────────────────────────────────────────┘
```
