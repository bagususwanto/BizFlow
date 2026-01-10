# Inventory Management User Flow

Dokumentasi alur pengguna untuk modul Manajemen Inventori BizFlow.

> 📌 **Wireframes:** Lihat [Inventory Management Wireframes](wireframes/06-inventory-management-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INVENTORY MANAGEMENT OVERVIEW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Stock     │  │   Stock     │  │   Stock     │  │  Warehouse  │        │
│  │   Opname    │  │  Transfer   │  │ Adjustment  │  │ Management  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Fitur Utama:                                                               │
│  • Stock Opname (penghitungan fisik stok)                                   │
│  • Stock Transfer antar gudang                                              │
│  • Stock Adjustment (penyesuaian stok manual)                               │
│  • Multi-warehouse management                                               │
│  • Stock card & movement history                                            │
│  • Low stock alerts                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Stock Opname Flow

### 2.1 Create Stock Opname

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CREATE STOCK OPNAME FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Stock Opname"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Stock Opname baru    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  HEADER STOCK OPNAME                                                  │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Opname *       (auto-generate: SO-YYYYMMDD-XXXX)               │
  │  • Tanggal Opname *   (default: hari ini)                             │
  │  • Gudang *           (pilih gudang)                                  │
  │  • Kategori Produk    (opsional: filter kategori)                     │
  │  • Petugas Opname *   (PIC)                                           │
  │  • Catatan            (notes)                                         │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  DETAIL ITEMS                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌──────────────────────────────────────────────────────────────┐     │
  │  │ # │ SKU      │ Produk      │ Stok Sistem │ Stok Fisik │ Diff │     │
  │  ├───┼──────────┼─────────────┼─────────────┼────────────┼──────┤     │
  │  │ 1 │ MKN-001  │ Indomie     │     100     │ [    98  ] │  -2  │     │
  │  │ 2 │ MNM-002  │ Aqua 600ml  │      50     │ [    50  ] │   0  │     │
  │  │ 3 │ MNM-003  │ Teh Botol   │      30     │ [    32  ] │  +2  │     │
  │  └───┴──────────┴─────────────┴─────────────┴────────────┴──────┘     │
  │                                                                       │
  │  [ 🔍 Scan Barcode ]  [ 📋 Load All Products ]                        │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  SUMMARY                                                              │
  │                                                                       │
  │  Total Items      :    180                                            │
  │  Items Matched    :      1  (0 selisih)                               │
  │  Items Over       :      1  (+2 selisih)                              │
  │  Items Short      :      1  (-2 selisih)                              │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Simpan Draft       │
  │  • Submit untuk       │
  │    Approval           │
  └───────────┬───────────┘
              │
              ▼
           [END]
```

### 2.2 Stock Opname Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STOCK OPNAME STATE DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────────────┘

                           Create Opname
                               │
                               ▼
                       ┌───────────────┐
                       │    DRAFT      │
                       │   (Konsep)    │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         [Delete]          [Submit]          [Edit]
              │                │                │
              ▼                ▼                │
         [DELETED]     ┌───────────────┐        │
                       │   PENDING     │◀───────┘
                       │  (Menunggu)   │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          [Reject]         [Approve]        [Revise]
              │                │                │
              ▼                ▼                │
       ┌───────────┐   ┌───────────────┐        │
       │ REJECTED  │   │   APPROVED    │        │
       └───────────┘   │ (Disetujui)   │        │
                       └───────┬───────┘        │
                               │                │
                               ▼                │
                       ┌───────────────┐        │
                       │   ADJUSTED    │◀───────┘
                       │ (Stok Update) │
                       └───────────────┘
```

---

## 3. Stock Transfer Flow

### 3.1 Create Stock Transfer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CREATE STOCK TRANSFER FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Transfer Stok"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Stock Transfer baru  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  HEADER TRANSFER                                                      │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Transfer *     (auto-generate: TRF-YYYYMMDD-XXXX)              │
  │  • Tanggal Transfer * (default: hari ini)                             │
  │  • Gudang Asal *      (dropdown)                                      │
  │  • Gudang Tujuan *    (dropdown)                                      │
  │  • Alasan Transfer    (restock, redistribute, dll)                    │
  │  • Catatan            (notes)                                         │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  DETAIL ITEMS                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │ 🔍 Cari atau scan produk...                                     │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  ┌──────────────────────────────────────────────────────────────┐     │
  │  │ # │ SKU      │ Produk      │ Stok Asal │ Qty Transfer │ Aksi │     │
  │  ├───┼──────────┼─────────────┼───────────┼──────────────┼──────┤     │
  │  │ 1 │ MKN-001  │ Indomie     │    100    │ [     20   ] │  🗑  │     │
  │  │ 2 │ MNM-002  │ Aqua 600ml  │     50    │ [     10   ] │  🗑  │     │
  │  └───┴──────────┴─────────────┴───────────┴──────────────┴──────┘     │
  │                                                                       │
  │  [ + Tambah Item ]                                                    │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi:            │
  │  • Qty <= Stok Asal   │
  │  • Gudang berbeda     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Submit Transfer      │
  └───────────┬───────────┘
              │
              ▼
           [END]
```

### 3.2 Stock Transfer Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STOCK TRANSFER STATE DIAGRAM                           │
└─────────────────────────────────────────────────────────────────────────────┘

                           Create Transfer
                               │
                               ▼
                       ┌───────────────┐
                       │    PENDING    │
                       │  (Menunggu)   │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          [Cancel]         [Approve]        [Reject]
              │                │                │
              ▼                ▼                ▼
       ┌───────────┐   ┌───────────────┐  ┌───────────┐
       │ CANCELLED │   │  IN TRANSIT   │  │ REJECTED  │
       └───────────┘   │ (Dalam Proses)│  └───────────┘
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │  User Gudang  │
                       │  Tujuan Terima│
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         [Partial]         [Full]          [Reject]
              │                │                │
              ▼                ▼                ▼
       ┌───────────┐   ┌───────────────┐  ┌───────────┐
       │  PARTIAL  │   │   COMPLETED   │  │ REJECTED  │
       │ (Sebagian)│   │   (Selesai)   │  └───────────┘
       └───────────┘   └───────────────┘
```

---

## 4. Stock Adjustment Flow

### 4.1 Create Stock Adjustment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CREATE STOCK ADJUSTMENT FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Adjustment"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Stock Adjustment     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  HEADER ADJUSTMENT                                                    │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Adjustment *   (auto-generate: ADJ-YYYYMMDD-XXXX)              │
  │  • Tanggal *          (default: hari ini)                             │
  │  • Gudang *           (dropdown)                                      │
  │  • Tipe Adjustment *  (Penambahan / Pengurangan)                      │
  │  • Alasan *           (Rusak, Expired, Koreksi, Hilang, dll)          │
  │  • Catatan            (notes)                                         │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  DETAIL ITEMS                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │ 🔍 Cari atau scan produk...                                     │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  ┌──────────────────────────────────────────────────────────────┐     │
  │  │ # │ SKU      │ Produk      │ Stok Saat Ini │ Qty Adj │ Aksi │     │
  │  ├───┼──────────┼─────────────┼───────────────┼─────────┼──────┤     │
  │  │ 1 │ MKN-001  │ Indomie     │      100      │ [  -5 ] │  🗑  │     │
  │  │   │          │             │    → 95       │  Rusak  │      │     │
  │  │ 2 │ MNM-003  │ Teh Botol   │       30      │ [ -10 ] │  🗑  │     │
  │  │   │          │             │    → 20       │ Expired │      │     │
  │  └───┴──────────┴─────────────┴───────────────┴─────────┴──────┘     │
  │                                                                       │
  │  [ + Tambah Item ]                                                    │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Submit Adjustment    │
  │  (perlu approval?)    │
  └───────────┬───────────┘
              │
              ▼
           [END]
```

---

## 5. Warehouse Management Flow

### 5.1 Warehouse CRUD Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WAREHOUSE CRUD FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Menu: Inventori > Gudang
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan daftar     │
  │  gudang               │
  └───────────┬───────────┘
              │
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
  [+ Tambah]      [Action Menu]
     │                 │
     ▼                 ├──→ 👁️ Lihat Detail
  ┌───────────────┐    ├──→ ✏️ Edit
  │ Form Gudang:  │    ├──→ 📊 Lihat Stok
  │ • Kode        │    └──→ ❌ Nonaktifkan
  │ • Nama        │
  │ • Alamat      │
  │ • PIC         │
  │ • Status      │
  └───────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan               │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 6. Stock Card Flow

### 6.1 View Stock Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VIEW STOCK CARD FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User pilih produk > Lihat Kartu Stok
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  STOCK CARD                                                           │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Produk    : Indomie Goreng                                           │
  │  SKU       : MKN-001                                                  │
  │  Gudang    : [Semua Gudang ▾]                                         │
  │  Periode   : [01 Jan - 07 Jan 2024]                                   │
  │                                                                       │
  │  Saldo Awal : 85 pcs                                                  │
  │                                                                       │
  │  ┌──────────┬───────────────┬───────┬─────┬─────┬────────┐            │
  │  │ Tanggal  │ Referensi     │ Tipe  │ In  │ Out │ Saldo  │            │
  │  ├──────────┼───────────────┼───────┼─────┼─────┼────────┤            │
  │  │ 02 Jan   │ PO-001        │ Masuk │ +50 │  -  │   135  │            │
  │  │ 03 Jan   │ INV-001       │ Keluar│  -  │ -10 │   125  │            │
  │  │ 04 Jan   │ TRF-001       │ Trans │  -  │ -20 │   105  │            │
  │  │ 05 Jan   │ ADJ-001       │ Adj   │  -  │  -5 │   100  │            │
  │  │ 07 Jan   │ INV-002       │ Keluar│  -  │  -2 │    98  │            │
  │  └──────────┴───────────────┴───────┴─────┴─────┴────────┘            │
  │                                                                       │
  │  Saldo Akhir: 98 pcs                                                  │
  │                                                                       │
  │  [ 📥 Export Excel ]  [ 🖨️ Print ]                                   │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
           [END]
```

---

## 7. Low Stock Alert Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LOW STOCK ALERT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [TRIGGER] Stok produk <= Minimum Stock
              │
              ▼
  ┌───────────────────────┐
  │  Generate Alert       │
  │  (sistem otomatis)    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  NOTIFIKASI                                                           │
  │                                                                       │
  │  • Dashboard widget: Stok Kritis                                      │
  │  • Email ke user terkait                                              │
  │  • Push notification (mobile app)                                     │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  User Action:         │
  │  • View detail        │
  │  • Create PO          │
  │  • Dismiss alert      │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 8. Wireframes Reference

> **Lihat:** [Inventory Management Wireframes](./wireframes/06-inventory-management-wireframes.md)

| Wireframe                                                                                             | Deskripsi            |
| ----------------------------------------------------------------------------------------------------- | -------------------- |
| [Stock Opname List](./wireframes/06-inventory-management-wireframes.md#1-stock-opname-list)           | Daftar stock opname  |
| [Stock Opname Form](./wireframes/06-inventory-management-wireframes.md#2-stock-opname-form)           | Form stock opname    |
| [Stock Transfer List](./wireframes/06-inventory-management-wireframes.md#3-stock-transfer-list)       | Daftar transfer      |
| [Stock Transfer Form](./wireframes/06-inventory-management-wireframes.md#4-stock-transfer-form)       | Form transfer stok   |
| [Transfer Receive Form](./wireframes/06-inventory-management-wireframes.md#4a-transfer-receive-form)  | Form terima transfer |
| [Stock Adjustment List](./wireframes/06-inventory-management-wireframes.md#5-stock-adjustment-list)   | Daftar adjustment    |
| [Stock Adjustment Form](./wireframes/06-inventory-management-wireframes.md#5a-stock-adjustment-form)  | Form adjustment      |
| [Warehouse List](./wireframes/06-inventory-management-wireframes.md#6-warehouse-list)                 | Daftar gudang        |
| [Warehouse Form](./wireframes/06-inventory-management-wireframes.md#6a-warehouse-form-modal)          | Form gudang          |
| [Stock Card](./wireframes/06-inventory-management-wireframes.md#7-stock-card)                         | Kartu stok produk    |
| [Low Stock Alert Widget](./wireframes/06-inventory-management-wireframes.md#8-low-stock-alert-widget) | Widget stok kritis   |
