# BizFlow ERP - Project Roadmap

> Roadmap lengkap pengembangan BizFlow ERP berdasarkan dokumentasi requirements dan technical specifications.

## 📊 Project Overview

| Aspek               | Detail                                                   |
| ------------------- | -------------------------------------------------------- |
| **Nama Proyek**     | BizFlow ERP                                              |
| **Target Pengguna** | UMKM Indonesia (Retail, F&B, Distributor, Service)       |
| **Deployment**      | On-premise (Local Network, Private Cloud, Hybrid)        |
| **Platform**        | Desktop (Windows/macOS/Linux), Web Browser, Tablet (PWA) |
| **Bahasa**          | Indonesia (primary), English (fallback)                  |

---

## 🎯 Milestone Summary

```mermaid
gantt
    title BizFlow ERP Development Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section Phase 0
    Project Setup           :done, p0, 2026-01-12, 2w

    section Phase 1 (MVP)
    Core Module                 :active, p1a, after p0, 3w
    Master Data Module          :p1b, after p1a, 3w
    POS Module                  :p1c, after p1b, 4w
    Inventory (Basic)           :p1d, after p1c, 2w
    Basic Reports & Dashboard   :p1e, after p1d, 2w
    Desktop App                 :p1f, after p1e, 3w

    section Phase 2 (Core)
    Purchases Module        :p2a, after p1f, 4w
    Inventory (Advanced)    :p2b, after p2a, 3w
    Sales Module (Extended) :p2c, after p2b, 3w
    Finance Module          :p2d, after p2c, 4w
    Complete Reporting      :p2e, after p2d, 2w

    section Phase 3 (Advanced)
    Multi-outlet & Cloud    :p3a, after p2e, 4w
    PWA & Offline Mode      :p3b, after p3a, 3w
    Payment Integration     :p3c, after p3b, 3w

    section Phase 4 (Growth)
    E-Commerce Integration  :p4a, after p3c, 4w
    Advanced Analytics      :p4b, after p4a, 4w
```

---

## 📐 Phase 0 - Project Setup (2 Minggu)

**Goal**: Foundation setup untuk monorepo, database, testing, dan sistem lisensi.

### Deliverables

| Task                                                                         | Status | Owner | Est. |
| ---------------------------------------------------------------------------- | ------ | ----- | ---- |
| Setup Turborepo monorepo (`apps/api`, `apps/web`, `apps/desktop`)            | [x]    | -     | 2d   |
| Setup shared packages (`packages/types`, `packages/ui`, `packages/database`) | [x]    | -     | 2d   |
| Konfigurasi Prisma + SQLite schema                                           | [x]    | -     | 2d   |
| Setup Vitest + Playwright untuk testing                                      | [x]    | -     | 2d   |
| Setup CI/CD (GitHub Actions)                                                 | [x]    | -     | 1d   |
| Implementasi offline license system                                          | [-]    | -     | 3d   |

### Technical Requirements

- **Monorepo**: Turborepo dengan pnpm workspace
- **Database**: Prisma ORM + SQLite (dev), PostgreSQL (cloud)
- **Testing**: Vitest (unit), Playwright (E2E)
- **License**: Cryptographic validation dengan public/private key

---

## 🚀 Phase 1 - MVP (3-4 Bulan)

**Goal**: Sistem kasir fungsional dengan manajemen produk, penjualan, dan laporan dasar.

### 1.1 Core Module

> Modul inti sistem: autentikasi, user management, role & permission, audit log.

Referensi: [02-user-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/02-user-management.md)

| Task                                         | Status | Priority |
| -------------------------------------------- | ------ | -------- |
| **Auth** - Login/logout dengan password      | [x]    | High     |
| **Auth** - Login dengan PIN (quick access)   | [x]    | Medium   |
| **Auth** - Refresh token mechanism           | [x]    | High     |
| **Auth** - Password reset flow               | [ ]    | Medium   |
| **Users** - CRUD User                        | [ ]    | High     |
| **Users** - Multi-outlet assignment          | [ ]    | Medium   |
| **Roles** - CRUD Role                        | [x]    | High     |
| **Roles** - Permission management (granular) | [x]    | High     |
| **Outlets** - CRUD Outlet                    | [ ]    | Medium   |
| **Audit Log** - Log aktivitas user           | [ ]    | Medium   |
| **Settings** - App settings management       | [ ]    | Medium   |

**API Endpoints**: `/api/v1/core/auth/*`, `/api/v1/core/users/*`, `/api/v1/core/roles/*`, `/api/v1/core/outlets/*`, `/api/v1/core/audit-log/*`

---

### 1.2 Master Data Module

> Data master: produk, kategori, satuan, pelanggan, gudang.

Referensi: [03-product-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/03-product-management.md)

| Task                                   | Status | Priority |
| -------------------------------------- | ------ | -------- |
| **Categories** - CRUD Kategori         | [ ]    | High     |
| **Categories** - Hierarchical (nested) | [ ]    | Medium   |
| **Products** - CRUD Produk             | [ ]    | High     |
| **Products** - Barcode/SKU support     | [ ]    | High     |
| **Products** - Product image upload    | [ ]    | Low      |
| **Products** - Product variants        | [ ]    | Medium   |
| **Products** - Price levels            | [ ]    | Medium   |
| **Products** - Stock alert (min stock) | [ ]    | High     |
| **Units** - CRUD Unit of Measure       | [ ]    | High     |
| **Units** - Konversi satuan            | [ ]    | Medium   |
| **Customers** - CRUD Customer          | [ ]    | High     |
| **Customers** - Credit limit           | [ ]    | Medium   |
| **Warehouses** - CRUD Warehouse        | [ ]    | High     |

**API Endpoints**: `/api/v1/master-data/products/*`, `/api/v1/master-data/categories/*`, `/api/v1/master-data/units/*`, `/api/v1/master-data/customers/*`, `/api/v1/master-data/warehouses/*`

---

### 1.3 POS Module

> Point of Sale: transaksi kasir, pembayaran, struk.

Referensi: [01-pos.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/01-pos.md)

| Task                                           | Status | Priority |
| ---------------------------------------------- | ------ | -------- |
| Quick sale dengan barcode scanner              | [ ]    | High     |
| Product search (nama/SKU)                      | [ ]    | High     |
| Cart management (add, edit qty, remove)        | [ ]    | High     |
| Multiple payment (cash, QRIS, transfer, split) | [ ]    | High     |
| Customer selection untuk loyalty               | [ ]    | Medium   |
| Hold transaction (simpan sementara)            | [ ]    | Medium   |
| Discount (item, transaksi, promo)              | [ ]    | Medium   |
| Print struk (thermal 58mm, 80mm)               | [ ]    | High     |
| Keyboard shortcuts                             | [ ]    | Medium   |
| Return/Refund processing                       | [ ]    | Medium   |

**API Endpoints**: `/api/v1/pos/*`

---

### 1.4 Inventory Module (Basic)

> Stok dasar untuk mendukung POS: tracking stok, mutasi otomatis dari penjualan.

Referensi: [06-inventory-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/06-inventory-management.md)

| Task                             | Status | Priority |
| -------------------------------- | ------ | -------- |
| Stock overview per produk/lokasi | [ ]    | High     |
| Auto deduct stock on sale        | [ ]    | High     |
| Stock movement tracking (in/out) | [ ]    | High     |
| Low stock alert                  | [ ]    | Medium   |

**API Endpoints**: `/api/v1/inventory/stock/*`

---

### 1.5 Basic Reports & Dashboard

> Laporan dasar dan dashboard untuk monitoring bisnis.

Referensi: [08-reporting-analytics.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/08-reporting-analytics.md)

| Task                                        | Status | Priority |
| ------------------------------------------- | ------ | -------- |
| Dashboard ringkasan bisnis                  | [ ]    | High     |
| Laporan penjualan (harian/mingguan/bulanan) | [ ]    | High     |
| Laporan stok                                | [ ]    | High     |
| Export PDF/Excel                            | [ ]    | High     |

**API Endpoints**: `/api/v1/reports/dashboard/*`, `/api/v1/reports/sales/*`, `/api/v1/reports/inventory/*`

---

### 1.6 Desktop App

> Electron wrapper untuk deployment on-premise.

Referensi: [09-desktop-app.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/09-desktop-app.md)

| Task                                    | Status | Priority |
| --------------------------------------- | ------ | -------- |
| Electron wrapper dengan embedded server | [ ]    | High     |
| System tray integration                 | [ ]    | High     |
| Server lifecycle management             | [ ]    | High     |
| Logs viewer (filter, export)            | [ ]    | Medium   |
| Backup/Restore functionality            | [ ]    | High     |
| License activation flow                 | [ ]    | High     |
| One-click installer (Windows/Mac/Linux) | [ ]    | High     |
| Auto-update checker                     | [ ]    | Medium   |

**Build Output**: `BizFlow-Setup-1.0.0.exe` (~150MB)

---

## 🔧 Phase 2 - Core Features (3-4 Bulan)

**Goal**: Complete core ERP modules untuk operasional bisnis sehari-hari.

### 2.1 Purchases Module

> Pembelian: supplier, purchase order, penerimaan barang, retur.

Referensi: [05-purchase-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/05-purchase-management.md)

| Task                            | Status | Priority |
| ------------------------------- | ------ | -------- |
| **Suppliers** - CRUD Supplier   | [ ]    | High     |
| **Orders** - Purchase Order     | [ ]    | High     |
| **Orders** - PO status workflow | [ ]    | High     |
| **Goods Receive** - Penerimaan  | [ ]    | High     |
| **Returns** - Purchase Return   | [ ]    | Medium   |
| **Payments** - Supplier Payment | [ ]    | High     |
| Payment terms management        | [ ]    | Medium   |
| Purchase history per supplier   | [ ]    | High     |
| Auto-reorder (stok minimum)     | [ ]    | Low      |

**API Endpoints**: `/api/v1/master-data/suppliers/*`, `/api/v1/purchases/orders/*`, `/api/v1/purchases/goods-receive/*`, `/api/v1/purchases/returns/*`, `/api/v1/purchases/payments/*`

---

### 2.2 Inventory Module (Advanced)

> Inventory lanjutan: adjustment, transfer, stock opname.

| Task                                     | Status | Priority |
| ---------------------------------------- | ------ | -------- |
| **Adjustments** - Stock correction       | [ ]    | High     |
| **Adjustments** - Approval workflow      | [ ]    | Medium   |
| **Transfers** - Inter-warehouse transfer | [ ]    | Medium   |
| **Transfers** - Transfer status workflow | [ ]    | Medium   |
| **Opname** - Stock counting              | [ ]    | High     |
| **Opname** - Finalization & adjustment   | [ ]    | High     |
| Batch/Lot tracking                       | [ ]    | Low      |
| Expiry date tracking                     | [ ]    | Medium   |
| Stock valuation (HPP)                    | [ ]    | High     |

**API Endpoints**: `/api/v1/inventory/adjustments/*`, `/api/v1/inventory/transfers/*`, `/api/v1/inventory/opname/*`

---

### 2.3 Sales Module (Extended)

> Sales order, delivery, retur, kredit pelanggan.

Referensi: [04-sales-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/04-sales-management.md)

| Task                            | Status | Priority |
| ------------------------------- | ------ | -------- |
| **Orders** - Sales Order        | [ ]    | High     |
| **Orders** - Invoice            | [ ]    | High     |
| **Orders** - Delivery Order     | [ ]    | Medium   |
| **Returns** - Sales Return      | [ ]    | Medium   |
| **Payments** - Customer Payment | [ ]    | High     |
| Quotation (penawaran harga)     | [ ]    | Low      |
| Sales history per customer      | [ ]    | High     |

**API Endpoints**: `/api/v1/sales/orders/*`, `/api/v1/sales/returns/*`, `/api/v1/sales/payments/*`

---

### 2.4 Finance Module

> Keuangan: kas, bank, transaksi, pengeluaran.

Referensi: [07-cash-bank-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/07-cash-bank-management.md)

| Task                               | Status | Priority |
| ---------------------------------- | ------ | -------- |
| **Accounts** - Multi rekening bank | [ ]    | High     |
| **Accounts** - Kas kecil           | [ ]    | High     |
| **Transactions** - Payment In      | [ ]    | High     |
| **Transactions** - Payment Out     | [ ]    | High     |
| **Transactions** - Bank transfer   | [ ]    | Medium   |
| **Expenses** - Expense categories  | [ ]    | High     |
| Bank reconciliation                | [ ]    | Medium   |
| Receipt/Payment voucher            | [ ]    | Medium   |
| AR/AP - Piutang pelanggan          | [ ]    | High     |
| AR/AP - Hutang supplier            | [ ]    | High     |
| AR/AP - Aging report               | [ ]    | Medium   |

**API Endpoints**: `/api/v1/finance/accounts/*`, `/api/v1/finance/transactions/*`, `/api/v1/finance/expenses/*`

---

### 2.5 Complete Reporting

> Laporan lengkap: pembelian, inventory, keuangan.

| Task                           | Status | Priority |
| ------------------------------ | ------ | -------- |
| Laporan pembelian              | [ ]    | High     |
| Laporan inventory & mutasi     | [ ]    | High     |
| Laporan laba rugi (P&L)        | [ ]    | High     |
| Laporan arus kas (Cash Flow)   | [ ]    | High     |
| Laporan AR/AP                  | [ ]    | High     |
| Product analysis (best seller) | [ ]    | Medium   |
| Customer analysis              | [ ]    | Medium   |

**API Endpoints**: `/api/v1/reports/purchases/*`, `/api/v1/reports/financial/*`

---

## ⚡ Phase 3 - Advanced Features (2-3 Bulan)

**Goal**: Fitur lanjutan untuk skalabilitas dan integrasi.

### 3.1 Multi-outlet (Option B/C)

| Task                             | Status | Priority |
| -------------------------------- | ------ | -------- |
| Docker deployment setup          | [ ]    | High     |
| PostgreSQL migration dari SQLite | [ ]    | High     |
| Central management dashboard     | [ ]    | High     |
| Per-outlet access control        | [ ]    | High     |
| Inter-outlet stock transfer      | [ ]    | Medium   |

---

### 3.2 PWA & Offline Mode

| Task                          | Status | Priority |
| ----------------------------- | ------ | -------- |
| Service Worker implementation | [ ]    | High     |
| Offline-first architecture    | [ ]    | High     |
| Background sync               | [ ]    | High     |
| IndexedDB local storage       | [ ]    | Medium   |

---

### 3.3 Payment Integration

| Task                               | Status | Priority |
| ---------------------------------- | ------ | -------- |
| QRIS integration (Midtrans/Xendit) | [ ]    | High     |
| Virtual Account support            | [ ]    | Medium   |
| Split payment enhancement          | [ ]    | Medium   |

---

## 📈 Phase 4 - Growth (Ongoing)

**Goal**: Ekspansi fitur dan integrasi ekosistem.

### 4.1 E-Commerce Integration

| Task                       | Status | Priority |
| -------------------------- | ------ | -------- |
| Tokopedia marketplace sync | [ ]    | Medium   |
| Shopee marketplace sync    | [ ]    | Medium   |
| TikTok Shop integration    | [ ]    | Low      |
| Unified order management   | [ ]    | Medium   |

---

### 4.2 Advanced Analytics

| Task                         | Status | Priority |
| ---------------------------- | ------ | -------- |
| Advanced business dashboard  | [ ]    | Medium   |
| Trend analysis & forecasting | [ ]    | Low      |
| Custom report builder        | [ ]    | Low      |

---

### 4.3 API & Extensibility

| Task                       | Status | Priority |
| -------------------------- | ------ | -------- |
| Public API for third-party | [ ]    | Low      |
| Webhook support            | [ ]    | Low      |
| Plugin architecture        | [ ]    | Low      |

---

## 📚 Documentation Reference

### User Flow Documents

| Module                | Document                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Point of Sale         | [01-pos.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/01-pos.md)                                   |
| User Management       | [02-user-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/02-user-management.md)           |
| Product Management    | [03-product-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/03-product-management.md)     |
| Sales Management      | [04-sales-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/04-sales-management.md)         |
| Purchase Management   | [05-purchase-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/05-purchase-management.md)   |
| Inventory Management  | [06-inventory-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/06-inventory-management.md) |
| Cash & Bank           | [07-cash-bank-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/07-cash-bank-management.md) |
| Reporting & Analytics | [08-reporting-analytics.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/08-reporting-analytics.md)   |
| Desktop App           | [09-desktop-app.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/09-desktop-app.md)                   |
| License Management    | [10-license-management.md](file:///Users/bagus/Project/personal/BizFlow/docs/user-flow/10-license-management.md)     |

### Technical Specifications

| Document                                                                                                                         | Description                             |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [01-architecture.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/01-architecture.md)                       | System architecture, monorepo structure |
| [02-database-schema.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/02-database-schema.md)                 | Prisma schema, ERD, table definitions   |
| [03-api-specifications.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/03-api-specifications.md)           | RESTful API design, endpoints           |
| [04-frontend-specifications.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/04-frontend-specifications.md) | Page routes, state management           |
| [05-security.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/05-security.md)                               | Authentication, authorization           |
| [06-hardware-integration.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/06-hardware-integration.md)       | Printer, barcode scanner                |
| [07-deployment.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/07-deployment.md)                           | Electron, Docker setup                  |
| [08-testing.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/08-testing.md)                                 | Test strategy                           |
| [09-performance.md](file:///Users/bagus/Project/personal/BizFlow/docs/technical-specs/09-performance.md)                         | Response time targets                   |

---

## 💰 Licensing Model

| Paket          | Harga          | Fitur                          |
| -------------- | -------------- | ------------------------------ |
| **Starter**    | Rp 2.500.000   | 1 outlet, 3 user, fitur dasar  |
| **Business**   | Rp 7.500.000   | 5 outlet, 20 user, semua fitur |
| **Enterprise** | Rp 15.000.000+ | Unlimited, custom, source code |

---

## ✅ Status Legend

| Status | Description                     |
| ------ | ------------------------------- |
| `[ ]`  | TODO - Belum dimulai            |
| `[/]`  | IN PROGRESS - Sedang dikerjakan |
| `[x]`  | DONE - Selesai                  |
| `[-]`  | ON HOLD - Ditunda               |
| `[~]`  | CANCELLED - Dibatalkan          |

---

_Last updated: 2026-01-14_
