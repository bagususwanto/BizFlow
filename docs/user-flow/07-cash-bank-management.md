# Cash & Bank Management User Flow

Dokumentasi alur pengguna untuk modul Manajemen Kas & Bank BizFlow.

> 📌 **Wireframes:** Lihat [Cash & Bank Wireframes](wireframes/07-cash-bank-management-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CASH & BANK MANAGEMENT OVERVIEW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Account   │  │ Transaction │  │  Account    │  │  Account    │        │
│  │ Management  │  │  Recording  │  │ Receivable  │  │  Payable    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Fitur Utama:                                                               │
│  • Kelola akun kas dan bank                                                 │
│  • Catat pemasukan (income)                                                 │
│  • Catat pengeluaran (expense)                                              │
│  • Transfer antar akun                                                      │
│  • Kelola piutang (AR) & hutang (AP)                                        │
│  • Kategori pengeluaran                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Account Management Flow

### 2.1 Account CRUD Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ACCOUNT MANAGEMENT FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Menu: Keuangan > Akun
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan daftar     │
  │  akun (kas & bank)    │
  └───────────┬───────────┘
              │
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
  [+ Tambah]      [Action Menu]
     │                 │
     ▼                 ├──→ 👁️ Lihat Detail
  ┌───────────────┐    ├──→ ✏️ Edit
  │ Form Akun:    │    ├──→ 📊 Lihat Transaksi
  │ • Kode        │    └──→ ❌ Nonaktifkan
  │ • Nama        │
  │ • Tipe:       │
  │   - Kas       │
  │   - Bank      │
  │   - Piutang   │
  │   - Hutang    │
  │ • Nama Bank   │
  │ • No. Rekening│
  │ • Saldo Awal  │
  └───────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi & Simpan    │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.2 Account Type Description

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ACCOUNT TYPES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  💵 KAS (Cash)                                                       │   │
│  │  ─────────────────────────────────────────────────────────────────   │   │
│  │  • Uang tunai di kasir                                               │   │
│  │  • Petty cash                                                        │   │
│  │  • Kas kecil outlet                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🏦 BANK                                                             │   │
│  │  ─────────────────────────────────────────────────────────────────   │   │
│  │  • Rekening giro                                                     │   │
│  │  • Rekening tabungan                                                 │   │
│  │  • Virtual account                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📈 PIUTANG (Receivable)                                             │   │
│  │  ─────────────────────────────────────────────────────────────────   │   │
│  │  • Piutang dagang (dari penjualan kredit)                            │   │
│  │  • Auto-generated dari Sales Order (credit)                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📉 HUTANG (Payable)                                                 │   │
│  │  ─────────────────────────────────────────────────────────────────   │   │
│  │  • Hutang dagang (dari pembelian kredit)                             │   │
│  │  • Auto-generated dari Purchase Order (credit)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Transaction Recording Flow

### 3.1 Record Income Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RECORD INCOME FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Catat Pemasukan"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Input Pemasukan      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  FORM PEMASUKAN                                                       │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Transaksi *    (auto-generate: INC-YYYYMMDD-XXXX)              │
  │  • Tanggal *          (default: hari ini)                             │
  │  • Akun Tujuan *      (pilih kas/bank)                                │
  │  • Jumlah *           (Rp)                                            │
  │  • Kategori           (opsional)                                      │
  │  • Deskripsi *        (keterangan)                                    │
  │  • Referensi          (no. invoice, dll)                              │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Transaksi     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update saldo akun    │
  │  (saldo + jumlah)     │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 3.2 Record Expense Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RECORD EXPENSE FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Catat Pengeluaran"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Input Pengeluaran    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  FORM PENGELUARAN                                                     │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Transaksi *    (auto-generate: EXP-YYYYMMDD-XXXX)              │
  │  • Tanggal *          (default: hari ini)                             │
  │  • Akun Sumber *      (pilih kas/bank)                                │
  │  • Kategori *         (pilih kategori pengeluaran)                    │
  │  • Jumlah *           (Rp)                                            │
  │  • Deskripsi *        (keterangan)                                    │
  │  • Bukti              (upload foto/file)                              │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi:            │
  │  • Saldo cukup?       │
  └───────────┬───────────┘
              │
     ┌────────┴────────┐
     │ Ya              │ Tidak
     ▼                 ▼
  [Simpan]          [Error: Saldo tidak cukup]
     │
     ▼
  ┌───────────────────────┐
  │  Update saldo akun    │
  │  (saldo - jumlah)     │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 3.3 Transfer Between Accounts Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TRANSFER BETWEEN ACCOUNTS FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Transfer"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  FORM TRANSFER                                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Transaksi *    (auto-generate: TRF-YYYYMMDD-XXXX)              │
  │  • Tanggal *          (default: hari ini)                             │
  │  • Dari Akun *        (pilih kas/bank sumber)                         │
  │  • Ke Akun *          (pilih kas/bank tujuan)                         │
  │  • Jumlah *           (Rp)                                            │
  │  • Deskripsi          (opsional)                                      │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi:            │
  │  • Akun berbeda?      │
  │  • Saldo cukup?       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Proses Transfer:     │
  │  • Akun asal - jumlah │
  │  • Akun tujuan +jumlah│
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 4. Account Receivable (AR) Flow

### 4.1 AR Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ACCOUNT RECEIVABLE OVERVIEW                           │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────┐
  │  PIUTANG DAGANG                                                       │
  │                                                                       │
  │  Sumber Piutang:                                                      │
  │  • Sales Order dengan pembayaran "Kredit"                             │
  │  • Invoice yang belum dibayar lunas                                   │
  │                                                                       │
  │  Data yang Ditampilkan:                                               │
  │  ┌──────────┬──────────┬─────────┬──────────┬─────────┬──────────┐   │
  │  │ Customer │ No. SO   │ Tgl SO  │ Jth Tempo│ Total   │ Sisa     │   │
  │  ├──────────┼──────────┼─────────┼──────────┼─────────┼──────────┤   │
  │  │ Toko ABC │ SO-001   │ 01 Jan  │ 15 Jan   │ 1.5jt   │ 500rb    │   │
  │  │ PT XYZ   │ SO-002   │ 05 Jan  │ 20 Jan   │ 3.0jt   │ 3.0jt    │   │
  │  └──────────┴──────────┴─────────┴──────────┴─────────┴──────────┘   │
  │                                                                       │
  │  Filter:                                                              │
  │  • By Customer                                                        │
  │  • By Due Date (jatuh tempo)                                         │
  │  • By Status (Belum Jth Tempo / Jth Tempo / Lewat Jth Tempo)         │
  └───────────────────────────────────────────────────────────────────────┘
```

### 4.2 Receive Payment from Customer Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RECEIVE PAYMENT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User pilih piutang > "Terima Pembayaran"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  FORM TERIMA PEMBAYARAN                                               │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Customer     : Toko ABC                                              │
  │  No. Invoice  : INV-20240101-001                                      │
  │  Total Tagihan: Rp 1.500.000                                          │
  │  Sudah Dibayar: Rp 1.000.000                                          │
  │  Sisa Piutang : Rp 500.000                                            │
  │                                                                       │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Jumlah Bayar *   : [Rp 500.000         ]                             │
  │  Metode Pembayaran: [Cash ▾] [Transfer ▾] [QRIS ▾]                    │
  │  Akun Tujuan *    : [Kas Utama ▾]                                     │
  │  Referensi        : [                   ]                             │
  │  Catatan          : [                   ]                             │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Pembayaran    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update:              │
  │  • Saldo piutang (-) │
  │  • Saldo kas (+)     │
  │  • Status SO         │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 5. Account Payable (AP) Flow

### 5.1 AP Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ACCOUNT PAYABLE OVERVIEW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────┐
  │  HUTANG DAGANG                                                        │
  │                                                                       │
  │  Sumber Hutang:                                                       │
  │  • Purchase Order dengan pembayaran "Kredit"                          │
  │  • Invoice supplier yang belum dibayar                                │
  │                                                                       │
  │  Data yang Ditampilkan:                                               │
  │  ┌──────────┬──────────┬─────────┬──────────┬─────────┬──────────┐   │
  │  │ Supplier │ No. PO   │ Tgl PO  │ Jth Tempo│ Total   │ Sisa     │   │
  │  ├──────────┼──────────┼─────────┼──────────┼─────────┼──────────┤   │
  │  │ PT Dist  │ PO-001   │ 01 Jan  │ 31 Jan   │ 5.0jt   │ 3.0jt    │   │
  │  │ CV Suplr │ PO-002   │ 10 Jan  │ 10 Feb   │ 2.5jt   │ 2.5jt    │   │
  │  └──────────┴──────────┴─────────┴──────────┴─────────┴──────────┘   │
  │                                                                       │
  │  Aging Report:                                                        │
  │  • Current (belum jatuh tempo)                                        │
  │  • 1-30 hari                                                          │
  │  • 31-60 hari                                                         │
  │  • 61-90 hari                                                         │
  │  • > 90 hari                                                          │
  └───────────────────────────────────────────────────────────────────────┘
```

### 5.2 Pay Supplier Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PAY SUPPLIER FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User pilih hutang > "Bayar"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  FORM PEMBAYARAN SUPPLIER                                             │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Supplier     : PT Distributor Utama                                  │
  │  No. PO       : PO-20240101-001                                       │
  │  Total Tagihan: Rp 5.000.000                                          │
  │  Sudah Dibayar: Rp 2.000.000                                          │
  │  Sisa Hutang  : Rp 3.000.000                                          │
  │                                                                       │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Jumlah Bayar *   : [Rp 3.000.000       ]                             │
  │  Akun Sumber *    : [Bank BCA ▾]                                      │
  │  Referensi        : [TRF-001234567      ]                             │
  │  Catatan          : [                   ]                             │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi saldo akun  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Pembayaran    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update:              │
  │  • Saldo hutang (-)   │
  │  • Saldo bank (-)     │
  │  • Status PO          │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 6. Expense Category Flow

### 6.1 Expense Category CRUD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXPENSE CATEGORY MANAGEMENT                           │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Menu: Keuangan > Kategori Pengeluaran
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  DAFTAR KATEGORI PENGELUARAN                                          │
  │                                                                       │
  │  ┌───────────────────────────────────────────────────────────────┐   │
  │  │ Nama Kategori          │ Deskripsi           │ Total Bulan Ini│   │
  │  ├────────────────────────┼─────────────────────┼────────────────┤   │
  │  │ 🏠 Sewa & Utilitas      │ Sewa, listrik, air  │ Rp 5.500.000   │   │
  │  │ 👥 Gaji & Upah          │ Gaji karyawan       │ Rp 15.000.000  │   │
  │  │ 📦 Perlengkapan         │ ATK, supplies       │ Rp 750.000     │   │
  │  │ 🚚 Transportasi         │ Ongkir, bensin      │ Rp 1.200.000   │   │
  │  │ 🔧 Maintenance          │ Perbaikan, service  │ Rp 500.000     │   │
  │  │ 📱 Telekomunikasi       │ Internet, telepon   │ Rp 450.000     │   │
  │  │ 📋 Lain-lain            │ Pengeluaran lain    │ Rp 300.000     │   │
  │  └───────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  [+ Tambah Kategori]                                                  │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 7. Cash Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CASH FLOW SUMMARY                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────┐
  │  📊 RINGKASAN ARUS KAS                           Periode: Januari 2024│
  │                                                                       │
  │  ┌──────────────────────────────────────────────────────────────┐     │
  │  │                      PEMASUKAN                               │     │
  │  │  ─────────────────────────────────────────────────────────   │     │
  │  │  Penjualan Tunai        : Rp  45.000.000                     │     │
  │  │  Penerimaan Piutang     : Rp  12.500.000                     │     │
  │  │  Pendapatan Lain        : Rp     500.000                     │     │
  │  │  ─────────────────────────────────────────────────────────   │     │
  │  │  Total Pemasukan        : Rp  58.000.000                     │     │
  │  └──────────────────────────────────────────────────────────────┘     │
  │                                                                       │
  │  ┌──────────────────────────────────────────────────────────────┐     │
  │  │                      PENGELUARAN                             │     │
  │  │  ─────────────────────────────────────────────────────────   │     │
  │  │  Pembelian Barang       : Rp  25.000.000                     │     │
  │  │  Pembayaran Hutang      : Rp   8.000.000                     │     │
  │  │  Gaji Karyawan          : Rp  15.000.000                     │     │
  │  │  Operasional            : Rp   5.500.000                     │     │
  │  │  ─────────────────────────────────────────────────────────   │     │
  │  │  Total Pengeluaran      : Rp  53.500.000                     │     │
  │  └──────────────────────────────────────────────────────────────┘     │
  │                                                                       │
  │  ┌──────────────────────────────────────────────────────────────┐     │
  │  │  NET CASH FLOW          : Rp   4.500.000   ▲ +8.4%           │     │
  │  └──────────────────────────────────────────────────────────────┘     │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 8. Wireframes Reference

> **Lihat:** [Cash & Bank Management Wireframes](./wireframes/07-cash-bank-management-wireframes.md)

| Wireframe                                                                                                   | Deskripsi              |
| ----------------------------------------------------------------------------------------------------------- | ---------------------- |
| [Account List](./wireframes/07-cash-bank-management-wireframes.md#1-account-list)                           | Daftar akun kas & bank |
| [Account Form](./wireframes/07-cash-bank-management-wireframes.md#2-account-form-modal)                     | Form tambah/edit akun  |
| [Transaction List](./wireframes/07-cash-bank-management-wireframes.md#3-transaction-list)                   | Daftar transaksi       |
| [Income Form](./wireframes/07-cash-bank-management-wireframes.md#4-income-form)                             | Form pemasukan         |
| [Expense Form](./wireframes/07-cash-bank-management-wireframes.md#5-expense-form)                           | Form pengeluaran       |
| [Transfer Form](./wireframes/07-cash-bank-management-wireframes.md#6-transfer-form)                         | Form transfer          |
| [AR List](./wireframes/07-cash-bank-management-wireframes.md#7-account-receivable-list)                     | Daftar piutang         |
| [Receive Payment Modal](./wireframes/07-cash-bank-management-wireframes.md#8-receive-payment-modal)         | Modal terima bayar     |
| [AP List](./wireframes/07-cash-bank-management-wireframes.md#9-account-payable-list)                        | Daftar hutang          |
| [Pay Supplier Modal](./wireframes/07-cash-bank-management-wireframes.md#10-pay-supplier-modal)              | Modal bayar supplier   |
| [Expense Category List](./wireframes/07-cash-bank-management-wireframes.md#11-expense-category-list)        | Daftar kategori        |
| [Expense Category Form](./wireframes/07-cash-bank-management-wireframes.md#11a-expense-category-form-modal) | Form kategori          |
| [Cash Flow Dashboard](./wireframes/07-cash-bank-management-wireframes.md#12-cash-flow-dashboard)            | Dashboard arus kas     |
| [Account Detail Page](./wireframes/07-cash-bank-management-wireframes.md#13-account-detail-page)            | Detail akun + riwayat  |
| [Transaction Detail](./wireframes/07-cash-bank-management-wireframes.md#14-transaction-detail-modal)        | Detail transaksi       |
