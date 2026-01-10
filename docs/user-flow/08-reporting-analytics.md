# Reporting & Analytics User Flow

Dokumentasi alur pengguna untuk modul Laporan & Analitik BizFlow.

> 📌 **Wireframes:** Lihat [Reporting Wireframes](wireframes/08-reporting-analytics-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REPORTING & ANALYTICS OVERVIEW                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Dashboard  │  │   Sales     │  │  Purchase   │  │  Inventory  │        │
│  │   Summary   │  │   Reports   │  │  Reports    │  │  Reports    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                          │
│  │  Profit &   │  │  Cash Flow  │  │   AR / AP   │                          │
│  │    Loss     │  │   Report    │  │   Aging     │                          │
│  └─────────────┘  └─────────────┘  └─────────────┘                          │
│                                                                             │
│  Fitur Utama:                                                               │
│  • Dashboard real-time dengan KPI                                           │
│  • Laporan penjualan (by product, customer, cashier)                        │
│  • Laporan pembelian (by supplier)                                          │
│  • Laporan inventori (stock valuation, movement)                            │
│  • Laporan keuangan (P&L, Cash Flow, Aging)                                 │
│  • Export (Excel, PDF, Print)                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard Flow

### 2.1 Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DASHBOARD OVERVIEW FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User buka halaman Dashboard
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  DASHBOARD WIDGETS                                                    │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  1. SALES TODAY                                                       │
  │     • Total penjualan hari ini                                        │
  │     • Jumlah transaksi                                                │
  │     • Perbandingan vs kemarin                                         │
  │                                                                       │
  │  2. TOP PRODUCTS                                                      │
  │     • 5 produk terlaris hari ini                                      │
  │     • Qty terjual                                                     │
  │                                                                       │
  │  3. STOCK ALERTS                                                      │
  │     • Produk dengan stok di bawah minimum                             │
  │     • Quick action untuk reorder                                      │
  │                                                                       │
  │  4. CASH POSITION                                                     │
  │     • Saldo kas & bank                                                │
  │     • Piutang & hutang outstanding                                    │
  │                                                                       │
  │  5. RECENT TRANSACTIONS                                               │
  │     • 10 transaksi terakhir                                           │
  │     • Quick link ke detail                                            │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Auto-refresh setiap  │
  │  60 detik             │
  └───────────────────────┘
```

---

## 3. Sales Report Flow

### 3.1 Sales Report Menu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SALES REPORT MENU                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Menu: Laporan > Penjualan
              │
              ├──→ [Sales Summary] ────→ Ringkasan penjualan per periode
              │
              ├──→ [Sales by Product] ──→ Penjualan per produk
              │
              ├──→ [Sales by Customer] ─→ Penjualan per customer
              │
              ├──→ [Sales by Cashier] ──→ Penjualan per kasir
              │
              └──→ [Sales by Outlet] ────→ Penjualan per outlet
```

### 3.2 Generate Sales Report Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GENERATE SALES REPORT FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User pilih tipe laporan
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  FILTER REPORT                                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Periode *     : [Hari Ini ▾] [Minggu Ini] [Bulan Ini] [Custom]       │
  │  Tanggal       : [01 Jan 2024] - [07 Jan 2024]                       │
  │  Outlet        : [Semua Outlet ▾]                                     │
  │  Kategori      : [Semua Kategori ▾]                                   │
  │  Customer      : [Semua Customer ▾]                                   │
  │                                                                       │
  │  [Generate Report]                                                    │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Load data laporan    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  REPORT VIEWER                                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  • Summary cards (total, qty, avg)                                    │
  │  • Chart (bar/line/pie)                                               │
  │  • Detail table                                                       │
  │                                                                       │
  │  Actions: [Export Excel] [Export PDF] [Print]                         │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
           [END]
```

---

## 4. Purchase Report Flow

### 4.1 Purchase Report Menu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PURCHASE REPORT MENU                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Menu: Laporan > Pembelian
              │
              ├──→ [Purchase Summary] ────→ Ringkasan pembelian per periode
              │
              ├──→ [Purchase by Product] ─→ Pembelian per produk
              │
              ├──→ [Purchase by Supplier] ─→ Pembelian per supplier
              │
              └──→ [Goods Receive Report] ─→ Laporan penerimaan barang
```

---

## 5. Inventory Report Flow

### 5.1 Inventory Report Menu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INVENTORY REPORT MENU                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Menu: Laporan > Inventori
              │
              ├──→ [Stock Summary] ───────→ Ringkasan stok saat ini
              │
              ├──→ [Stock Valuation] ─────→ Nilai stok (HPP)
              │
              ├──→ [Stock Movement] ──────→ Pergerakan stok (in/out)
              │
              ├──→ [Low Stock Report] ────→ Produk stok rendah
              │
              └──→ [Stock Opname Report] ─→ Laporan hasil opname
```

### 5.2 Stock Valuation Report

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STOCK VALUATION REPORT                                │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────┐
  │  LAPORAN NILAI STOK                                                   │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Tanggal   : 07 Januari 2024                                          │
  │  Gudang    : Semua Gudang                                             │
  │                                                                       │
  │  ┌────────┬────────────────┬──────┬───────────┬───────────────────┐   │
  │  │ SKU    │ Nama Produk    │ Qty  │ Cost/Unit │ Total Nilai       │   │
  │  ├────────┼────────────────┼──────┼───────────┼───────────────────┤   │
  │  │ PRD001 │ Indomie Goreng │ 250  │ Rp 2.500  │ Rp    625.000     │   │
  │  │ PRD002 │ Coca Cola 500ml│ 120  │ Rp 4.000  │ Rp    480.000     │   │
  │  │ PRD003 │ Rinso 900g     │ 80   │ Rp 15.000 │ Rp  1.200.000     │   │
  │  │ ...    │ ...            │ ...  │ ...       │ ...               │   │
  │  ├────────┴────────────────┴──────┴───────────┼───────────────────┤   │
  │  │ TOTAL NILAI STOK                           │ Rp 45.500.000     │   │
  │  └────────────────────────────────────────────┴───────────────────┘   │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 6. Financial Report Flow

### 6.1 Profit & Loss Report

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PROFIT & LOSS REPORT FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Menu: Laporan > Laba Rugi
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  LAPORAN LABA RUGI                                                    │
  │  Periode: 01 - 31 Januari 2024                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  PENDAPATAN                                                           │
  │  ├─ Penjualan Kotor                      Rp  85.000.000               │
  │  ├─ Diskon Penjualan                    (Rp   2.500.000)              │
  │  ├─ Retur Penjualan                     (Rp   1.000.000)              │
  │  └─ PENJUALAN BERSIH                     Rp  81.500.000               │
  │                                                                       │
  │  HARGA POKOK PENJUALAN (HPP)                                          │
  │  └─ HPP                                 (Rp  52.000.000)              │
  │                                                                       │
  │  ═══════════════════════════════════════════════════════════════      │
  │  LABA KOTOR                              Rp  29.500.000               │
  │                                                                       │
  │  BIAYA OPERASIONAL                                                    │
  │  ├─ Gaji Karyawan                       (Rp  15.000.000)              │
  │  ├─ Sewa & Utilitas                     (Rp   5.500.000)              │
  │  ├─ Perlengkapan                        (Rp     750.000)              │
  │  ├─ Transportasi                        (Rp   1.200.000)              │
  │  └─ Biaya Lain-lain                     (Rp     800.000)              │
  │  └─ TOTAL BIAYA OPERASIONAL             (Rp  23.250.000)              │
  │                                                                       │
  │  ═══════════════════════════════════════════════════════════════      │
  │  LABA BERSIH                             Rp   6.250.000  ▲ +8.1%      │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
```

### 6.2 Cash Flow Report

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CASH FLOW REPORT                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────┐
  │  LAPORAN ARUS KAS                                                     │
  │  Periode: 01 - 31 Januari 2024                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  SALDO AWAL                              Rp  87.000.000               │
  │                                                                       │
  │  ARUS KAS MASUK                                                       │
  │  ├─ Penerimaan Penjualan Tunai           Rp  45.000.000               │
  │  ├─ Penerimaan Piutang                   Rp  12.500.000               │
  │  └─ Pendapatan Lain                      Rp     500.000               │
  │  └─ TOTAL KAS MASUK                      Rp  58.000.000               │
  │                                                                       │
  │  ARUS KAS KELUAR                                                      │
  │  ├─ Pembayaran Pembelian                (Rp  25.000.000)              │
  │  ├─ Pembayaran Hutang                   (Rp   8.000.000)              │
  │  ├─ Gaji Karyawan                       (Rp  15.000.000)              │
  │  └─ Biaya Operasional                   (Rp   5.500.000)              │
  │  └─ TOTAL KAS KELUAR                    (Rp  53.500.000)              │
  │                                                                       │
  │  ═══════════════════════════════════════════════════════════════      │
  │  PERUBAHAN KAS BERSIH                    Rp   4.500.000               │
  │                                                                       │
  │  SALDO AKHIR                             Rp  91.500.000               │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
```

### 6.3 AR/AP Aging Report

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AR/AP AGING REPORT                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────┐
  │  LAPORAN AGING PIUTANG (AR)                                           │
  │  Per Tanggal: 07 Januari 2024                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌─────────────┬─────────┬─────────┬─────────┬─────────┬──────────┐   │
  │  │ Customer    │ Current │ 1-30    │ 31-60   │ 61-90   │ > 90     │   │
  │  ├─────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤   │
  │  │ Toko ABC    │ 2.5jt   │   -     │   -     │   -     │   -      │   │
  │  │ PT XYZ      │   -     │ 1.5jt   │ 500rb   │   -     │   -      │   │
  │  │ CV Sentosa  │   -     │   -     │   -     │ 800rb   │   -      │   │
  │  ├─────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤   │
  │  │ TOTAL       │ 2.5jt   │ 1.5jt   │ 500rb   │ 800rb   │   -      │   │
  │  └─────────────┴─────────┴─────────┴─────────┴─────────┴──────────┘   │
  │                                                                       │
  │  Total Piutang: Rp 5.300.000                                          │
  │                                                                       │
  │  ────────────────────────────────────────────────────────────────     │
  │                                                                       │
  │  LAPORAN AGING HUTANG (AP)                                            │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌─────────────┬─────────┬─────────┬─────────┬─────────┬──────────┐   │
  │  │ Supplier    │ Current │ 1-30    │ 31-60   │ 61-90   │ > 90     │   │
  │  ├─────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤   │
  │  │ PT Dist     │ 6.0jt   │   -     │   -     │   -     │   -      │   │
  │  │ CV Supplier │ 3.5jt   │   -     │   -     │   -     │   -      │   │
  │  │ Toko Grosir │   -     │ 2.0jt   │   -     │   -     │   -      │   │
  │  ├─────────────┼─────────┼─────────┼─────────┼─────────┼──────────┤   │
  │  │ TOTAL       │ 9.5jt   │ 2.0jt   │   -     │   -     │   -      │   │
  │  └─────────────┴─────────┴─────────┴─────────┴─────────┴──────────┘   │
  │                                                                       │
  │  Total Hutang: Rp 11.500.000                                          │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 7. Export & Print Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXPORT & PRINT FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik tombol Export/Print
              │
     ┌────────┴────────┬────────────────┐
     │                 │                │
     ▼                 ▼                ▼
  [Excel]          [PDF]           [Print]
     │                 │                │
     ▼                 ▼                ▼
  ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ Download│    │ Download│    │ Preview │
  │ .xlsx   │    │ .pdf    │    │ & Print │
  └─────────┘    └─────────┘    └─────────┘
```

---

## 8. Wireframes Reference

> **Lihat:** [Reporting & Analytics Wireframes](./wireframes/08-reporting-analytics-wireframes.md)

| Wireframe                                                                                         | Deskripsi              |
| ------------------------------------------------------------------------------------------------- | ---------------------- |
| [Dashboard](./wireframes/08-reporting-analytics-wireframes.md#1-main-dashboard)                   | Dashboard utama        |
| [Sales Report](./wireframes/08-reporting-analytics-wireframes.md#2-sales-report)                  | Laporan penjualan      |
| [Sales by Product](./wireframes/08-reporting-analytics-wireframes.md#3-sales-by-product)          | Penjualan per produk   |
| [Sales by Customer](./wireframes/08-reporting-analytics-wireframes.md#4-sales-by-customer)        | Penjualan per customer |
| [Sales by Cashier](./wireframes/08-reporting-analytics-wireframes.md#4a-sales-by-cashier)         | Penjualan per kasir    |
| [Sales by Outlet](./wireframes/08-reporting-analytics-wireframes.md#4b-sales-by-outlet)           | Penjualan per outlet   |
| [Purchase Report](./wireframes/08-reporting-analytics-wireframes.md#5-purchase-report)            | Laporan pembelian      |
| [Purchase by Supplier](./wireframes/08-reporting-analytics-wireframes.md#5a-purchase-by-supplier) | Pembelian per supplier |
| [Inventory Report](./wireframes/08-reporting-analytics-wireframes.md#6-inventory-report)          | Laporan inventori      |
| [Stock Movement](./wireframes/08-reporting-analytics-wireframes.md#6a-stock-movement-report)      | Pergerakan stok        |
| [Low Stock Report](./wireframes/08-reporting-analytics-wireframes.md#6b-low-stock-report)         | Stok rendah            |
| [Stock Valuation](./wireframes/08-reporting-analytics-wireframes.md#7-stock-valuation)            | Nilai stok             |
| [Profit & Loss](./wireframes/08-reporting-analytics-wireframes.md#8-profit-loss-report)           | Laporan laba rugi      |
| [Cash Flow Report](./wireframes/08-reporting-analytics-wireframes.md#9-cash-flow-report)          | Laporan arus kas       |
| [AR Aging Report](./wireframes/08-reporting-analytics-wireframes.md#10-ar-aging-report)           | Aging piutang          |
| [AP Aging Report](./wireframes/08-reporting-analytics-wireframes.md#11-ap-aging-report)           | Aging hutang           |
| [Report Parameters](./wireframes/08-reporting-analytics-wireframes.md#12-report-parameters-modal) | Modal filter laporan   |
| [Export Options](./wireframes/08-reporting-analytics-wireframes.md#13-export-options-modal)       | Dialog export          |
