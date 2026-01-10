# BizFlow ERP - Requirements Document

## 1. Ringkasan Eksekutif

**BizFlow** adalah sistem ERP terintegrasi yang dirancang khusus untuk bisnis menengah-kebawah di Indonesia. Sistem ini menyediakan solusi lengkap untuk mengelola operasional bisnis dengan interface sederhana dan harga terjangkau.

### Target Pengguna

- **Retail** - Toko kelontong, minimarket, toko pakaian, elektronik
- **Food & Beverage** - Restoran, cafe, kedai, catering
- **Distributor** - Supplier barang, agen penjualan
- **Service** - Bengkel, salon, laundry, jasa profesional

### Nilai Utama

- Interface sederhana dan mudah dipelajari
- Harga terjangkau untuk UMKM (one-time license)
- **On-premise deployment** - data tetap di server milik sendiri
- Dapat digunakan offline dalam jaringan lokal
- Support bahasa Indonesia
- Compliance dengan peraturan Indonesia (pajak, QRIS)

---

## 2. Modul Utama

### 2.1 Point of Sale (POS)

Modul kasir untuk transaksi penjualan langsung.

#### Fitur Utama

| Fitur              | Deskripsi                                       | Prioritas |
| ------------------ | ----------------------------------------------- | --------- |
| Quick Sale         | Transaksi cepat dengan barcode scanner          | High      |
| Product Search     | Pencarian produk dengan nama/SKU                | High      |
| Multiple Payment   | Pembayaran tunai, QRIS, transfer, split payment | High      |
| Customer Selection | Pilih pelanggan untuk loyalty/kredit            | Medium    |
| Hold Transaction   | Tahan transaksi sementara                       | Medium    |
| Return/Refund      | Proses retur dan refund                         | Medium    |
| Discount           | Diskon item, transaksi, dan promo               | Medium    |
| Receipt Printing   | Cetak struk (thermal printer)                   | High      |
| Offline Mode       | Bisa digunakan tanpa internet                   | High      |

#### User Stories

- Sebagai kasir, saya ingin bisa scan barcode agar transaksi lebih cepat
- Sebagai kasir, saya ingin bisa mencari produk dengan nama jika tidak ada barcode
- Sebagai kasir, saya ingin bisa menerima pembayaran QRIS dengan mudah
- Sebagai pemilik, saya ingin POS tetap bisa digunakan saat internet mati

---

### 2.2 Manajemen Produk & Layanan

#### Fitur Utama

| Fitur               | Deskripsi                                 | Prioritas |
| ------------------- | ----------------------------------------- | --------- |
| Product Master      | CRUD produk dengan detail lengkap         | High      |
| Category Management | Kategori dan sub-kategori produk          | High      |
| Unit of Measure     | Satuan (pcs, kg, liter, box, dll)         | High      |
| Unit Conversion     | Konversi satuan (1 box = 12 pcs)          | Medium    |
| Barcode/SKU         | Generate dan manage barcode               | High      |
| Product Image       | Upload gambar produk                      | Low       |
| Product Variant     | Varian (warna, ukuran, rasa)              | Medium    |
| Service Items       | Manajemen layanan/jasa                    | Medium    |
| Price Levels        | Harga bertingkat (grosir, retail, member) | Medium    |
| Stock Alert         | Notifikasi stok minimum                   | High      |

#### User Stories

- Sebagai admin, saya ingin bisa menambah produk baru dengan cepat
- Sebagai admin, saya ingin bisa set harga berbeda untuk customer retail dan grosir
- Sebagai admin, saya ingin mendapat notifikasi ketika stok menipis

---

### 2.3 Manajemen Penjualan

#### Fitur Utama

| Fitur               | Deskripsi                       | Prioritas |
| ------------------- | ------------------------------- | --------- |
| Sales Order         | Buat pesanan penjualan          | High      |
| Sales Invoice       | Faktur penjualan                | High      |
| Delivery Order      | Surat jalan pengiriman          | Medium    |
| Sales Return        | Retur penjualan                 | Medium    |
| Customer Management | Database pelanggan              | High      |
| Sales Pricing       | Harga khusus per customer       | Medium    |
| Credit Limit        | Batas kredit pelanggan          | Medium    |
| Sales History       | Riwayat transaksi per pelanggan | High      |
| Commission          | Komisi sales                    | Low       |
| Quotation           | Penawaran harga                 | Low       |

#### User Stories

- Sebagai sales, saya ingin bisa membuat pesanan untuk customer yang akan bayar nanti
- Sebagai admin, saya ingin bisa track piutang per customer
- Sebagai pemilik, saya ingin bisa melihat customer mana yang paling sering beli

---

### 2.4 Manajemen Pembelian

#### Fitur Utama

| Fitur               | Deskripsi                          | Prioritas |
| ------------------- | ---------------------------------- | --------- |
| Purchase Order      | Buat pesanan pembelian             | High      |
| Purchase Invoice    | Faktur pembelian dari supplier     | High      |
| Goods Receive       | Penerimaan barang                  | High      |
| Purchase Return     | Retur pembelian                    | Medium    |
| Supplier Management | Database supplier                  | High      |
| Purchase Pricing    | Harga khusus per supplier          | Medium    |
| Payment Terms       | Termin pembayaran                  | Medium    |
| Purchase History    | Riwayat pembelian per supplier     | High      |
| Auto Reorder        | Orderan otomatis saat stok minimum | Low       |

#### User Stories

- Sebagai purchasing, saya ingin bisa track barang yang sudah di-order tapi belum datang
- Sebagai admin, saya ingin bisa record hutang ke supplier
- Sebagai pemilik, saya ingin bisa lihat supplier mana yang memberikan harga terbaik

---

### 2.5 Manajemen Inventory

#### Fitur Utama

| Fitur            | Deskripsi                                 | Prioritas |
| ---------------- | ----------------------------------------- | --------- |
| Stock Overview   | Lihat stok per produk/lokasi              | High      |
| Stock Adjustment | Penyesuaian stok (koreksi, rusak, hilang) | High      |
| Stock Transfer   | Transfer antar lokasi/gudang              | Medium    |
| Stock Opname     | Stok opname fisik                         | High      |
| Multi-Location   | Multi gudang/outlet                       | Medium    |
| Batch/Lot        | Tracking batch dan lot                    | Low       |
| Expiry Date      | Tracking tanggal kadaluarsa               | Medium    |
| FIFO/LIFO        | Metode perhitungan stok                   | Medium    |
| Stock Valuation  | Valuasi stok (HPP)                        | High      |
| Stock Report     | Laporan stok dan mutasi                   | High      |

#### User Stories

- Sebagai staff gudang, saya ingin bisa melakukan stock opname dengan mudah
- Sebagai admin, saya ingin bisa track barang yang akan kadaluarsa
- Sebagai pemilik, saya ingin tahu nilai inventory yang saya miliki

---

### 2.6 Manajemen Kas & Bank

#### Fitur Utama

| Fitur               | Deskripsi                             | Prioritas |
| ------------------- | ------------------------------------- | --------- |
| Cash Flow           | Arus kas masuk dan keluar             | High      |
| Bank Account        | Multi rekening bank                   | High      |
| Cash Account        | Kas kecil / petty cash                | High      |
| Payment In          | Pembayaran masuk (pelanggan, lainnya) | High      |
| Payment Out         | Pembayaran keluar (supplier, biaya)   | High      |
| Bank Transfer       | Transfer antar rekening               | Medium    |
| Bank Reconciliation | Rekonsiliasi bank                     | Medium    |
| Expense Category    | Kategori pengeluaran                  | High      |
| Receipt Voucher     | Voucher penerimaan                    | Medium    |
| Payment Voucher     | Voucher pembayaran                    | Medium    |

#### User Stories

- Sebagai pemilik, saya ingin tahu posisi kas dan bank saya saat ini
- Sebagai kasir, saya ingin bisa record pengeluaran operasional harian
- Sebagai admin, saya ingin bisa track pembayaran yang masih outstanding

---

### 2.7 Laporan & Analitik

#### Fitur Utama

| Fitur             | Deskripsi                                     | Prioritas |
| ----------------- | --------------------------------------------- | --------- |
| Sales Report      | Laporan penjualan (harian, mingguan, bulanan) | High      |
| Purchase Report   | Laporan pembelian                             | High      |
| Inventory Report  | Laporan stok dan mutasi                       | High      |
| Profit/Loss       | Laporan laba rugi                             | High      |
| Cash Flow Report  | Laporan arus kas                              | High      |
| AR/AP Report      | Laporan piutang/hutang                        | High      |
| Dashboard         | Dashboard ringkasan bisnis                    | High      |
| Product Analysis  | Analisa produk terlaris/tidak laku            | Medium    |
| Customer Analysis | Analisa customer terbaik                      | Medium    |
| Export Report     | Export ke Excel/PDF                           | High      |

#### User Stories

- Sebagai pemilik, saya ingin lihat ringkasan bisnis di satu dashboard
- Sebagai pemilik, saya ingin tahu produk mana yang paling laris dan paling profit
- Sebagai admin, saya ingin export laporan untuk keperluan pajak

---

### 2.8 Manajemen User & Akses

#### Fitur Utama

| Fitur               | Deskripsi                     | Prioritas |
| ------------------- | ----------------------------- | --------- |
| User Management     | CRUD user                     | High      |
| Role Management     | Role-based access control     | High      |
| Permission          | Permission granular per fitur | High      |
| Login/Logout        | Autentikasi user              | High      |
| Audit Log           | Log aktivitas user            | Medium    |
| Multi-outlet Access | Akses per outlet              | Medium    |
| PIN/Password        | Security access               | High      |

#### User Stories

- Sebagai pemilik, saya ingin kasir hanya bisa akses POS
- Sebagai pemilik, saya ingin tahu siapa yang melakukan transaksi apa
- Sebagai admin, saya ingin bisa reset password user

---

## 3. Persyaratan Non-Fungsional

### 3.1 Performance

- Response time < 2 detik untuk operasi normal
- POS harus bisa handle 100+ transaksi per hari
- Support minimal 10 concurrent users

### 3.2 Reliability

- Uptime 99.5%
- Auto-backup harian
- Offline capability dengan sync otomatis

### 3.3 Security

- Enkripsi data sensitif
- HTTPS untuk semua komunikasi
- Session timeout
- Password hashing

### 3.4 Usability

- Interface dalam Bahasa Indonesia
- Mobile-responsive untuk tablet
- Workflow yang sederhana (max 3 klik untuk task umum)
- Keyboard shortcut untuk POS

### 3.5 Compatibility

- Web browser modern (Chrome, Firefox, Safari, Edge)
- Thermal printer support (58mm, 80mm)
- Barcode scanner USB/Bluetooth
- Cash drawer support

### 3.6 Scalability

- Support multi-outlet
- Database scalable untuk growth

---

## 4. Integrasi

### 4.1 Payment Gateway

- QRIS (standar nasional)
- Virtual Account (optional)

### 4.2 E-Commerce (Future)

- Tokopedia
- Shopee
- TikTok Shop

### 4.3 Accounting (Future)

- Export format untuk software akuntansi
- Jurnal.id integration

### 4.4 Delivery (Future)

- GoSend
- GrabExpress
- JNE/J&T

---

## 5. Tech Stack (Rekomendasi)

> [!NOTE]
> Tech stack yang dipilih harus ringan, mudah di-deploy on-premise, dan minimal dependency external.

### General Tech Stack (Semua Options)

#### Core Technologies

| Layer          | Teknologi                | Alasan                             |
| -------------- | ------------------------ | ---------------------------------- |
| **Language**   | TypeScript               | Type-safe, better DX               |
| **Backend**    | NestJS                   | Modular, enterprise-ready          |
| **Frontend**   | Next.js 14+              | SSR/SSG, React ecosystem           |
| **UI**         | Shadcn/UI + Tailwind     | Modern, customizable               |
| **ORM**        | Prisma                   | Type-safe, auto-migration          |
| **Validation** | Zod                      | Schema validation + type inference |
| **State**      | Zustand + TanStack Query | Simple, powerful                   |
| **Auth**       | JWT + Refresh Token      | Stateless, secure                  |

#### Development Tools

| Kategori       | Tool                | Fungsi                                      |
| -------------- | ------------------- | ------------------------------------------- |
| **Monorepo**   | Turborepo           | Manage frontend + backend dalam 1 repo      |
| **API Docs**   | Swagger/OpenAPI     | Auto-generate API documentation             |
| **Testing**    | Vitest + Playwright | Unit test + E2E browser testing             |
| **Code Gen**   | Plop.js             | Scaffold module/entity baru dengan template |
| **Dev Tools**  | Prisma Studio       | GUI untuk browse/edit database              |
| **Validation** | Zod                 | Schema validation + type inference          |
| **i18n**       | i18next             | Multi-language support (ID/EN)              |
| **Linting**    | ESLint + Prettier   | Code quality & formatting                   |

#### Struktur Monorepo

```
bizflow/
├── apps/
│   ├── desktop/          # Electron shell (Option A)
│   ├── api/              # NestJS backend
│   └── web/              # Next.js frontend
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   ├── database/         # Prisma schema & migrations
│   └── license/          # License validation module
├── turbo.json            # Turborepo config
└── package.json          # Root package
```

---

### Option A: Local Network (Jaringan Lokal) - One-Click Desktop App

Untuk bisnis yang hanya butuh akses dalam satu lokasi fisik (toko, kantor, restoran).

> [!IMPORTANT]
> Arsitektur disederhanakan agar bisa **one-click run** tanpa install dependencies terpisah.

#### Arsitektur Unified Server

```
┌─────────────────────────────────────────────────────────────────┐
│                      BizFlow.exe / BizFlow.app                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Electron Shell                         │  │
│  │  • Manage server lifecycle                                 │  │
│  │  • System tray icon                                        │  │
│  │  • Auto-update checker                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   NestJS Server (port 3000)                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │  │
│  │  │   SQLite    │  │   REST API  │  │   Static Files    │  │  │
│  │  │  (embedded) │  │  /api/*     │  │   (Next.js build) │  │  │
│  │  │ bizflow.db  │  │             │  │   /public/*       │  │  │
│  │  └─────────────┘  └─────────────┘  └───────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP Request
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│                         CLIENTS                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │  Browser    │  │  Tablet     │  │  Mobile Phone       │    │
│  │  (PC ini)   │  │  (POS)      │  │  (HP staff)         │    │
│  │  localhost  │  │  via WiFi   │  │  via WiFi           │    │
│  └─────────────┘  └─────────────┘  └─────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

#### Tech Stack (Option A Specific)

| Layer             | Teknologi                   | Alasan                                |
| ----------------- | --------------------------- | ------------------------------------- |
| **Shell**         | Electron                    | Wrapper untuk desktop app             |
| **Database**      | **SQLite** (better-sqlite3) | ⭐ Embedded, zero-config, single file |
| **Frontend Mode** | Next.js (static export)     | Pre-built, served oleh NestJS         |
| **Build**         | electron-builder            | Build installer Windows/Mac/Linux     |

> [!NOTE] > **Kenapa SQLite, bukan PostgreSQL?**
>
> - ✅ Tidak perlu install database terpisah
> - ✅ Single file (`bizflow.db`) - mudah backup
> - ✅ Cukup untuk 100+ transaksi/hari
> - ✅ Bisa handle 10+ concurrent users
> - ⚠️ Untuk skala lebih besar, upgrade ke PostgreSQL

#### Alur Startup (Saat User Klik BizFlow.exe)

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

#### 🚀 One-Click Installer

**Output per Platform:**
| Platform | File | Size (estimasi) |
|----------|------|-----------------|
| Windows | `BizFlow-Setup-1.0.0.exe` | ~150 MB |
| macOS | `BizFlow-1.0.0.dmg` | ~150 MB |
| Linux | `BizFlow-1.0.0.AppImage` | ~150 MB |
| Portable | `BizFlow-portable.zip` | ~150 MB |

**Yang Sudah Include:**

- ✅ Node.js runtime (embedded)
- ✅ NestJS server (compiled)
- ✅ Next.js frontend (static build)
- ✅ SQLite library (native binding)
- ✅ Default configuration
- ✅ Sample data (optional)

**Fitur Desktop App:**
| Fitur | Deskripsi |
|-------|-----------|
| **Main Window** | Status server, database info, uptime, URL akses, QR code |
| **System Tray** | Icon di taskbar untuk start/stop/restart server |
| **Logs Viewer** | Filter, search, export, clear logs |
| **Backup & Restore** | 1-click backup, pilih file restore, history |
| **Settings** | License, server port, auto-start, backup schedule, theme |

#### 🔑 License Management

**Sistem Lisensi:** 100% offline, tidak butuh cloud/VPS.

| Aspek        | Detail                             |
| ------------ | ---------------------------------- |
| **Aktivasi** | Manual via WhatsApp/Email          |
| **Binding**  | Terikat Machine ID (hardware)      |
| **Validasi** | Cryptographic (public/private key) |
| **Transfer** | Manual request ke support          |

**Keuntungan Sistem Offline:**
| Aspek | Keuntungan |
|-------|------------|
| **Biaya** | ❌ Tidak perlu VPS/cloud |
| **Maintenance** | ❌ Tidak perlu maintain server |
| **Reliability** | ✅ Tidak tergantung internet |
| **Security** | ✅ Cryptographic, tidak bisa dipalsukan |
| **Personal Touch** | ✅ Interaksi langsung dengan customer |

#### Minimum Specs

| Komponen | Minimum                                 | Recommended |
| -------- | --------------------------------------- | ----------- |
| OS       | Windows 10 / macOS 10.14 / Ubuntu 20.04 | Latest      |
| CPU      | 2 Core                                  | 4 Core      |
| RAM      | 4 GB                                    | 8 GB        |
| Storage  | 500 MB (app) + 1 GB (data)              | 5 GB+       |
| Browser  | Chrome 90+ / Firefox 90+ / Edge 90+     | Latest      |

#### File Structure (Setelah Install)

```

📁 BizFlow/
├── 📄 BizFlow.exe # Main executable
├── 📁 resources/
│ ├── 📄 app.asar # Bundled app code
│ └── 📁 bin/
│ └── 📄 server # NestJS compiled binary
├── 📁 data/ # User data (jangan hapus!)
│ ├── 📄 bizflow.db # SQLite database
│ ├── 📄 config.json # User configuration
│ └── 📁 uploads/ # Product images, attachments
├── 📁 logs/
│ └── 📄 bizflow.log # Application logs
└── 📁 backups/ # Auto & manual backups
└── 📄 backup-2024-01-07.zip

```

#### Network Access (Multi-Device dalam Jaringan)

```
┌─────────────────────────────────────────────────┐
│                  Local Network                   │
│                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │   POS   │    │  Admin  │    │ Mobile  │     │
│  │ Tablet  │    │ Laptop  │    │  Phone  │     │
│  └────┬────┘    └────┬────┘    └────┬────┘     │
│       │              │              │           │
│       └──────────────┼──────────────┘           │
│                      │                          │
│              ┌───────▼───────┐                  │
│              │  WiFi Router  │                  │
│              └───────┬───────┘                  │
│                      │                          │
│              ┌───────▼───────┐                  │
│              │  PC Server /  │                  │
│              │  PC Kasir     │                  │
│              │  (BizFlow)    │                  │
│              │  192.168.1.10 │                  │
│              └───────────────┘                  │
└─────────────────────────────────────────────────┘

Device lain akses via: http://192.168.1.10:3000
```

---

### Option B: Private Cloud (VPS/Cloud Pribadi)

Untuk bisnis dengan multi-outlet di lokasi berbeda yang butuh akses dari mana saja.

#### Tech Stack (Option B Specific)

| Layer        | Teknologi         | Alasan                      |
| ------------ | ----------------- | --------------------------- |
| **Database** | PostgreSQL        | Robust, scalable            |
| **Cache**    | Redis (optional)  | Session, caching jika perlu |
| **Queue**    | BullMQ (optional) | Background jobs, sync       |
| **PWA**      | Service Worker    | Offline capability          |

#### Infrastructure (Option B Specific)

| Komponen           | Teknologi                     | Alasan                            |
| ------------------ | ----------------------------- | --------------------------------- |
| **VPS Provider**   | DigitalOcean / Vultr / Linode | Murah, reliable, Singapore region |
| **Local Provider** | IDCloudHost / Dewaweb         | Data center Indonesia             |
| **Container**      | Docker + Docker Compose       | Easy deployment                   |
| **Reverse Proxy**  | Nginx / Traefik               | SSL, load balancing               |
| **SSL**            | Let's Encrypt                 | Gratis, auto-renew                |
| **CI/CD**          | GitHub Actions                | Auto-deploy on push               |
| **Monitoring**     | Uptime Kuma                   | Simple, self-hosted               |
| **Backup**         | Automated daily backup        | Snapshot VPS + database dump      |

#### Minimum Specs (VPS)

| Komponen       | Minimum           | Recommended       |
| -------------- | ----------------- | ----------------- |
| CPU            | 2 vCPU            | 4 vCPU            |
| RAM            | 4 GB              | 8 GB              |
| Storage        | 50 GB SSD         | 100 GB SSD        |
| Bandwidth      | 1 TB/bulan        | 2 TB/bulan        |
| Estimasi Biaya | ~Rp 150.000/bulan | ~Rp 300.000/bulan |

#### Network Topology

```
┌─────────────────────────────────────────────────────────┐
│                        INTERNET                          │
└────────────────────────────┬────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   VPS Server    │
                    │    (Cloud)      │
                    │ ───────────────-│
                    │  • Nginx        │
                    │  • Next.js      │
                    │  • NestJS API   │
                    │  • PostgreSQL   │
                    │  • Redis        │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼───────┐   ┌───────▼───────┐
│   Outlet 1    │   │   Outlet 2     │   │   Outlet 3    │
│   (Jakarta)   │   │   (Bandung)    │   │   (Surabaya)  │
│               │   │                │   │               │
│  ┌─────────┐  │   │  ┌─────────┐   │   │  ┌─────────┐  │
│  │   POS   │  │   │  │   POS   │   │   │  │   POS   │  │
│  └─────────┘  │   │  └─────────┘   │   │  └─────────┘  │
└───────────────┘   └────────────────┘   └───────────────┘
```

---

### Option C: Hybrid (Local + Cloud Sync)

Untuk enterprise yang butuh redundancy dan disaster recovery.

#### Arsitektur

- **Primary**: Local server di kantor pusat
- **Secondary**: VPS cloud untuk backup & sync
- **Sync**: Real-time atau scheduled sync antar server
- **Failover**: Auto-switch ke cloud jika local down

#### Teknologi Tambahan

| Komponen            | Teknologi                                 | Fungsi                |
| ------------------- | ----------------------------------------- | --------------------- |
| Sync Engine         | **Custom sync service**                   | Real-time data sync   |
| Message Queue       | **RabbitMQ** atau **Redis Pub/Sub**       | Event-driven sync     |
| Conflict Resolution | **Last-write-wins** atau **manual merge** | Handle sync conflicts |

---

### Perbandingan Options

| Aspek             | Local Network             | Private Cloud        | Hybrid            |
| ----------------- | ------------------------- | -------------------- | ----------------- |
| **Biaya Awal**    | Rp 3-5 juta (hardware)    | Rp 0                 | Rp 3-5 juta       |
| **Biaya Bulanan** | Rp 0 (hanya listrik)      | Rp 150-300rb         | Rp 150-300rb      |
| **Akses Remote**  | ❌ Tidak                  | ✅ Ya                | ✅ Ya             |
| **Multi-outlet**  | ⚠️ Terbatas lokasi        | ✅ Ya                | ✅ Ya             |
| **Offline Mode**  | ✅ Full offline           | ⚠️ Butuh internet    | ✅ Ya             |
| **Data Privacy**  | ✅ 100% lokal             | ⚠️ Di cloud          | ✅ Lokal + backup |
| **Maintenance**   | 🔧 Self-managed           | 🔧 Self-managed      | 🔧 Complex        |
| **Skalabilitas**  | ⚠️ Terbatas               | ✅ Easy scale        | ✅ Easy scale     |
| **Cocok untuk**   | 1 outlet, privacy-focused | Multi-outlet, mobile | Enterprise, DR    |

---

### Rekomendasi per Tipe Bisnis

| Tipe Bisnis             | Rekomendasi   | Alasan                            |
| ----------------------- | ------------- | --------------------------------- |
| **Toko Kelontong**      | Local Network | Simple, no internet needed        |
| **Restoran 1 outlet**   | Local Network | Fast, reliable, no recurring cost |
| **Franchise 5+ outlet** | Private Cloud | Centralized management            |
| **Distributor**         | Private Cloud | Mobile sales, multi-location      |
| **Enterprise**          | Hybrid        | Maximum reliability               |

---

## 6. Roadmap

### Phase 0 - Project Setup (2 minggu)

- [ ] Setup Turborepo monorepo (`apps/api`, `apps/web`, `apps/desktop`)
- [ ] Setup shared packages (`packages/types`, `packages/ui`, `packages/database`)
- [ ] Konfigurasi Prisma + SQLite schema
- [ ] Setup Vitest + Playwright untuk testing
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Implementasi offline license system
  - [ ] CLI tool untuk generate license key
  - [ ] License validation module di app

### Phase 1 - MVP (3-4 bulan)

- [ ] **User & Access Management**
  - [ ] Login/logout
  - [ ] Role-based access (Owner, Admin, Kasir)
  - [ ] Audit log
- [ ] **Product Management (basic)**
  - [ ] Kategori & produk
  - [ ] Harga & stok
  - [ ] Barcode/SKU
- [ ] **POS**
  - [ ] Quick sale dengan barcode scanner
  - [ ] Multiple payment (cash, QRIS)
  - [ ] Print struk
- [ ] **Basic Reports**
  - [ ] Laporan penjualan harian
  - [ ] Laporan stok
- [ ] **Sales Management**
  - [ ] Customer database
  - [ ] Sales order & invoice
  - [ ] Credit limit pelanggan
- [ ] **Desktop App (Option A)**
  - [ ] Electron wrapper
  - [ ] System tray, logs viewer, backup/restore
  - [ ] One-click installer (Windows/Mac/Linux)

### Phase 2 - Core Features (2-3 bulan)

- [ ] **Purchase Management**
  - [ ] Purchase order
  - [ ] Goods receive
  - [ ] Supplier management
- [ ] **Inventory Management**
  - [ ] Stock adjustment
  - [ ] Stock transfer
  - [ ] Stock opname
- [ ] **Cash & Bank Management**
  - [ ] Multi rekening bank
  - [ ] Cash flow (masuk/keluar)
  - [ ] Payment in/out
  - [ ] Expense category
- [ ] **AR/AP Management**
  - [ ] Piutang pelanggan
  - [ ] Hutang supplier
- [ ] **Complete Reporting**
  - [ ] Laba rugi
  - [ ] Arus kas
  - [ ] AR/AP report
  - [ ] Export PDF/Excel

### Phase 3 - Advanced (2-3 bulan)

- [ ] **Multi-outlet** (Option B/C)
  - [ ] Docker deployment
  - [ ] PostgreSQL migration
  - [ ] Central management
- [ ] **PWA & Offline Mode**
  - [ ] Service Worker
  - [ ] Offline-first dengan sync
- [ ] **Payment Integration**
  - [ ] QRIS (Midtrans/Xendit)
  - [ ] Split payment

### Phase 4 - Growth (ongoing)

- [ ] **E-Commerce Integration**
  - [ ] Tokopedia
  - [ ] Shopee
- [ ] **Advanced Analytics**
  - [ ] Dashboard bisnis
  - [ ] Trend analysis
- [ ] **API & Extensibility**
  - [ ] Public API untuk third-party
  - [ ] Webhook support

---

## 7. Licensing Model (Rekomendasi)

> [!NOTE]
> Model lisensi one-time purchase, bukan subscription bulanan.

| Paket          | Harga (One-Time) | Fitur                          |
| -------------- | ---------------- | ------------------------------ |
| **Starter**    | Rp 2.500.000     | 1 outlet, 3 user, fitur dasar  |
| **Business**   | Rp 7.500.000     | 5 outlet, 20 user, semua fitur |
| **Enterprise** | Rp 15.000.000+   | Unlimited, custom, source code |

### Optional Services

| Service            | Harga             | Keterangan                      |
| ------------------ | ----------------- | ------------------------------- |
| Instalasi & Setup  | Rp 500.000        | Remote atau on-site             |
| Training           | Rp 300.000/sesi   | 2 jam per sesi                  |
| Support Tahunan    | 20% harga lisensi | Update + support 1 tahun        |
| Custom Development | Negotiable        | Fitur tambahan sesuai kebutuhan |

---

## 8. Appendix

### Glossary

- **POS**: Point of Sale - sistem kasir
- **SKU**: Stock Keeping Unit - kode unik produk
- **HPP**: Harga Pokok Penjualan
- **AR**: Account Receivable - piutang
- **AP**: Account Payable - hutang
- **QRIS**: QR Code Indonesian Standard

### References

- Sistem sejenis: Moka POS, Majoo, Pawoon, iReap
- Regulasi: UU PPN, standar QRIS Bank Indonesia
