# Purchase Management User Flow

Dokumentasi alur pengguna untuk modul Manajemen Pembelian BizFlow.

> 📌 **Wireframes:** Lihat [Purchase Management Wireframes](wireframes/05-purchase-management-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PURCHASE MANAGEMENT OVERVIEW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Purchase   │  │   Goods     │  │  Purchase   │  │  Supplier   │        │
│  │   Order     │  │   Receive   │  │   Return    │  │ Management  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Fitur Utama:                                                               │
│  • Purchase Order (PO) creation & management                                │
│  • Goods Receive Note (GRN)                                                 │
│  • Purchase Return / Retur pembelian                                        │
│  • Supplier database & management                                           │
│  • Accounts Payable (Hutang) tracking                                       │
│  • Purchase report & analytics                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Purchase Order Flow

### 2.1 Create Purchase Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CREATE PURCHASE ORDER FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Purchase Order"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Purchase Order baru  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  HEADER PURCHASE ORDER                                                │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. PO *           (auto-generate: PO-YYYYMMDD-XXXX)               │
  │  • Tanggal PO *       (default: hari ini)                             │
  │  • Supplier *         (dropdown / search)                             │
  │  • Alamat Pengiriman  (gudang tujuan)                                 │
  │  • Tanggal Pengiriman (expected delivery)                             │
  │  • Terms of Payment   (COD, 7 hari, 14 hari, 30 hari)                 │
  │  • Catatan            (notes untuk supplier)                          │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  DETAIL ITEMS                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌───────────────────────────────────────────────────────────────┐    │
  │  │ # │ Produk      │ Qty │ Satuan │ Harga    │ Diskon │ Subtotal │    │
  │  ├───┼─────────────┼─────┼────────┼──────────┼────────┼──────────┤    │
  │  │ 1 │ Indomie     │ 100 │ karton │  550.000 │   -    │55.000.000│    │
  │  │ 2 │ Aqua 600ml  │  50 │ karton │  180.000 │   5%   │ 8.550.000│    │
  │  │ 3 │ Teh Botol   │  30 │ karton │  240.000 │   -    │ 7.200.000│    │
  │  └───┴─────────────┴─────┴────────┴──────────┴────────┴──────────┘    │
  │                                                                       │
  │  [ + Tambah Item ]  [ 📋 Import dari Stock Alert ]                    │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  SUMMARY                                                              │
  │                                                                       │
  │                              Subtotal :      Rp  70.750.000           │
  │                              Diskon   :      Rp           -           │
  │                              PPN 11%  :      Rp   7.782.500           │
  │                              ─────────────────────────────            │
  │                              TOTAL    :      Rp  78.532.500           │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Simpan Draft       │
  │  • Simpan & Approve   │
  │  • Simpan & Kirim ke  │
  │    Supplier           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan PO            │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Notifikasi:          │
  │  "PO berhasil dibuat" │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.2 Purchase Order Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PURCHASE ORDER STATE DIAGRAM                           │
└─────────────────────────────────────────────────────────────────────────────┘

                           Create PO
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
         [Delete]         [Approve]         [Edit]
              │                │                │
              ▼                ▼                │
         [DELETED]     ┌───────────────┐        │
                       │   APPROVED    │◀───────┘
                       │ (Disetujui)   │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          [Cancel]      [Send to          [Partial
              │          Supplier]         Receive]
              ▼                │                │
       ┌───────────┐           ▼                │
       │ CANCELLED │   ┌───────────────┐        │
       └───────────┘   │    ORDERED    │◀───────┘
                       │ (Sudah Order) │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        [Partial       [Full Receive]      [Return]
         Receive]            │                │
              │              ▼                ▼
              │        ┌───────────────┐  ┌─────────┐
              └───────▶│   RECEIVED    │  │ RETURNED│
                       │   (Diterima)  │  └─────────┘
                       └───────┬───────┘
                               │
                         [Pay Invoice]
                               │
                               ▼
                       ┌───────────────┐
                       │   COMPLETED   │
                       │   (Selesai)   │
                       └───────────────┘
```

### 2.3 View PO Detail Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VIEW PO DETAIL FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Lihat Detail" pada PO
              │
              ▼
  ┌───────────────────────┐
  │  Load data PO         │
  │  beserta relasi       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tampilkan PO Detail Page                                             │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │  HEADER                                                         │  │
  │  │  • No. PO, Tanggal, Status (badge)                              │  │
  │  │  • Supplier info (nama, alamat, kontak)                         │  │
  │  │  • Gudang Tujuan, Terms of Payment, Tanggal Pengiriman          │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │  ITEMS TABLE                                                    │  │
  │  │  • Produk, Qty, Satuan, Harga, Diskon, Subtotal                 │  │
  │  │  • Summary: Subtotal, Diskon, PPN, Total                        │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │  TIMELINE/HISTORY                                               │  │
  │  │  • Dibuat: 07 Jan 2024 10:30 - Admin                            │  │
  │  │  • Approved: 07 Jan 2024 11:00 - Supervisor                     │  │
  │  │  • Dikirim: 07 Jan 2024 14:00 - Admin                           │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │  RELATED DOCUMENTS                                              │  │
  │  │  • GRN: GRN-20240108-001 (link)                                 │  │
  │  │  • Invoice Supplier: INV-SUP-001 (link)                         │  │
  │  │  • Return: - (belum ada)                                        │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Available Actions:   │
  │  (sesuai status PO)   │
  │  • Edit (jika Draft)  │
  │  • Approve            │
  │  • Terima Barang      │
  │  • Print              │
  │  • Cancel             │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.4 Print PO Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRINT PO FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Print PO"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan Print      │
  │  Options Dialog       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  PRINT OPTIONS                                                        │
  │                                                                       │
  │  Format Output:                                                       │
  │  ● Preview PDF (browser)                                              │
  │  ○ Download PDF                                                       │
  │  ○ Print langsung                                                     │
  │                                                                       │
  │  Template:                                                            │
  │  ● Template Standar                                                   │
  │  ○ Template dengan Kop Surat                                          │
  │  ○ Template Ringkas                                                   │
  │                                                                       │
  │  Options:                                                             │
  │  ☑ Tampilkan harga                                                    │
  │  ☑ Tampilkan diskon                                                   │
  │  ☑ Tampilkan logo perusahaan                                          │
  │  ☐ Tampilkan tanda tangan digital                                     │
  │  ☐ Tampilkan terms & conditions                                       │
  │                                                                       │
  │  Jumlah Copy: [1]                                                     │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Generate PDF         │
  └───────────┬───────────┘
              │
     ┌────────┴────────┐
     │                 │
     ▼ Preview         ▼ Download/Print
  ┌───────────────┐  ┌────────────────────┐
  │ Buka PDF di   │  │ Download file atau │
  │ tab baru      │  │ kirim ke printer   │
  └───────────────┘  └────────────────────┘
              │
              ▼
           [END]
```

---

## 3. Goods Receive Flow

### 3.1 Create Goods Receive Note (GRN)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GOODS RECEIVE NOTE FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Terima Barang" dari PO
              │
              ▼
  ┌───────────────────────┐
  │  Load data PO         │
  │  yang dipilih         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Goods Receive        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  GRN HEADER                                                           │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. GRN            (auto: GRN-YYYYMMDD-XXXX)                       │
  │  • Ref. PO            (link ke PO asal)                               │
  │  • Tanggal Terima     (default: hari ini)                             │
  │  • Supplier           (dari PO)                                       │
  │  • Gudang Tujuan      (dropdown)                                      │
  │  • No. Surat Jalan    (dari supplier)                                 │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  DETAIL ITEMS                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌──────────────────────────────────────────────────────────────────┐ │
  │  │ Produk       │ Qty Order │ Qty Diterima │ Qty Reject │ Catatan   │ │
  │  ├──────────────┼───────────┼──────────────┼────────────┼───────────┤ │
  │  │ Indomie      │    100    │     100      │     -      │           │ │
  │  │ Aqua 600ml   │     50    │      48      │     2      │ Bocor     │ │
  │  │ Teh Botol    │     30    │      30      │     -      │           │ │
  │  └──────────────┴───────────┴──────────────┴────────────┴───────────┘ │
  │                                                                       │
  │  Total Diterima: 178 item                                             │
  │  Total Reject  : 2 item                                               │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan GRN           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update:              │
  │  • Stok produk (+)    │
  │  • Status PO          │
  │  • Hutang/AP (+)      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Print GRN?           │
  │  [Yes] [No]           │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 3.2 Partial Receive Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PARTIAL RECEIVE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  Jika barang diterima sebagian:

  ┌───────────────────────────────────────────────────────────────────────┐
  │  PO: PO-20240107-001                                                  │
  │  Status: ORDERED                                                      │
  │                                                                       │
  │  ┌──────────────┬───────────┬──────────────┬────────────┬──────────┐  │
  │  │ Produk       │ Qty Order │ Received (1) │ Received(2)│ Sisa     │  │
  │  ├──────────────┼───────────┼──────────────┼────────────┼──────────┤  │
  │  │ Indomie      │    100    │      60      │     40     │    0     │  │
  │  │ Aqua 600ml   │     50    │      30      │     18     │    2     │  │
  │  │ Teh Botol    │     30    │       -      │     30     │    0     │  │
  │  └──────────────┴───────────┴──────────────┴────────────┴──────────┘  │
  │                                                                       │
  │  Receive History:                                                     │
  │  • GRN-20240107-001: 90 item (07 Jan 2024)                            │
  │  • GRN-20240109-002: 88 item (09 Jan 2024)                            │
  │                                                                       │
  │  Sisa belum diterima: 2 item                                          │
  │  [ Close PO ] → Tutup PO meskipun tidak lengkap                       │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Purchase Return Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PURCHASE RETURN FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Retur Barang" dari GRN/PO
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Purchase Return      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  RETURN HEADER                                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Return         (auto: PRET-YYYYMMDD-XXXX)                      │
  │  • Ref. PO/GRN        (link ke dokumen asal)                          │
  │  • Tanggal Return     (default: hari ini)                             │
  │  • Alasan Return      (dropdown + text)                               │
  │    - Barang rusak                                                     │
  │    - Barang expired                                                   │
  │    - Salah kirim                                                      │
  │    - Kelebihan order                                                  │
  │    - Lainnya                                                          │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  RETURN ITEMS                                                         │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │ Produk        │ Qty Terima │ Qty Return │ Harga    │ Subtotal  │  │
  │  ├───────────────┼────────────┼────────────┼──────────┼───────────┤  │
  │  │ ☑ Aqua 600ml  │     48     │      2     │  180.000 │   7.500   │  │
  │  │   (2 karton reject)                                            │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │                              Total Return : Rp 7.500                  │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Aksi Return:         │
  │  ● Potong dari hutang │
  │  ○ Tukar dengan barang│
  │    pengganti          │
  │  ○ Refund             │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Return        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update:              │
  │  • Stok produk (-)    │
  │  • Hutang/AP (-)      │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 5. Supplier Management Flow

### 5.1 Supplier CRUD Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPPLIER CRUD FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Tambah Supplier"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  INFORMASI SUPPLIER                                                   │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Nama Supplier *      ┌───────────────────────────────────────────┐   │
  │                       │ PT Indofood CBP                           │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Kode Supplier        ┌───────────────────────────────────────────┐   │
  │  (auto/manual)        │ SUP-0015                                  │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Email               Phone                  Fax                       │
  │  ┌─────────────────┐ ┌─────────────────┐    ┌─────────────────┐       │
  │  │ sales@indofood  │ │ 021-5551234     │    │ 021-5551235     │       │
  │  └─────────────────┘ └─────────────────┘    └─────────────────┘       │
  │                                                                       │
  │  NPWP                                                                 │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ 01.234.567.8-012.000                                           │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Alamat                                                               │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ Jl. Sudirman Kav. 76-78, Jakarta 12910                         │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Contact Person       ┌───────────────────────────────────────────┐   │
  │                       │ Budi - Sales Manager (0812-xxxx-xxxx)     │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  PENGATURAN PEMBELIAN                                                 │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Terms of Payment     ┌───────────────────────────────────────────┐   │
  │  Default              │ 30 Hari                                 ▾ │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Mata Uang            ┌───────────────────────────────────────────┐   │
  │                       │ IDR - Rupiah                            ▾ │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Produk yang Disupply:                                                │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │  ☑ Indomie Goreng (MKN-IND01)                                  │   │
  │  │  ☑ Indomie Kuah (MKN-IND02)                                    │   │
  │  │  ☑ Supermie (MKN-SUP01)                                        │   │
  │  │  [ + Tambah Produk ]                                           │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Supplier      │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 6. Accounts Payable (Hutang) Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ACCOUNTS PAYABLE OVERVIEW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User akses menu "Hutang"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  AP AGING SUMMARY                                                     │
  │                                                                       │
  │  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────┐  │
  │  │  Current    │  1-30 hari  │  31-60 hari │  61-90 hari │  >90    │  │
  │  │  (Belum JT) │  (Overdue)  │  (Overdue)  │  (Overdue)  │  hari   │  │
  │  ├─────────────┼─────────────┼─────────────┼─────────────┼─────────┤  │
  │  │ 45.000.000  │ 22.500.000  │  8.000.000  │  3.500.000  │ 1.200.000│  │
  │  └─────────────┴─────────────┴─────────────┴─────────────┴─────────┘  │
  │                                                                       │
  │  Total Hutang: Rp 80.200.000                                          │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  AP LIST (By Supplier)                                                │
  │                                                                       │
  │  ┌────────────────┬───────────────┬─────────┬─────────┬───────────┐   │
  │  │ Supplier       │ Total Hutang  │ Current │ Overdue │ Action    │   │
  │  ├────────────────┼───────────────┼─────────┼─────────┼───────────┤   │
  │  │ PT Indofood    │    35.000.000 │  25.0jt │  10.0jt │ [Detail]  │   │
  │  │ PT Aqua Golden │    18.200.000 │  12.0jt │   6.2jt │ [Detail]  │   │
  │  │ Coca-Cola Amat │    15.000.000 │   8.0jt │   7.0jt │ [Detail]  │   │
  │  │ Lainnya        │    12.000.000 │    ... │   ...   │ [Detail]  │   │
  │  └────────────────┴───────────────┴─────────┴─────────┴───────────┘   │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Lihat detail       │
  │  • Bayar hutang       │
  │  • Export aging report│
  └───────────────────────┘
```

### 6.1 Pay Supplier Invoice Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PAY SUPPLIER INVOICE FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Bayar" dari invoice supplier
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan modal      │
  │  Payment              │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  PAYMENT DETAILS                                                      │
  │                                                                       │
  │  Supplier     : PT Indofood CBP                                       │
  │  Invoice      : INV-SUP-20240107-001                                  │
  │  Total        : Rp 78.532.500                                         │
  │  Sudah Bayar  : Rp 0                                                  │
  │  Sisa         : Rp 78.532.500                                         │
  │                                                                       │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Tanggal Bayar        ┌───────────────────────────────────────────┐   │
  │                       │ 07 Jan 2024                             📅│   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Jumlah Bayar         ┌───────────────────────────────────────────┐   │
  │                       │ Rp 78.532.500            [Bayar Penuh]    │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Dari Rekening        ┌───────────────────────────────────────────┐   │
  │                       │ BCA - 1234567890 (Saldo: 150jt)         ▾ │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Referensi            ┌───────────────────────────────────────────┐   │
  │                       │ TRF/20240107/xxx                          │   │
  │                       └───────────────────────────────────────────┘   │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Payment       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update:              │
  │  • Saldo rekening (-) │
  │  • Hutang supplier (-) │
  │  • Status PO          │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 7. PO from Stock Alert

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CREATE PO FROM STOCK ALERT                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User di Stock Alert Dashboard
              │
              ▼
  ┌───────────────────────┐
  │  Pilih produk low     │
  │  stock untuk reorder  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  SELECTED PRODUCTS FOR REORDER                                        │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │ ☑ Aqua 600ml        Stok: 25   Min: 30   Supplier: PT Aqua     │  │
  │  │ ☑ Roti Tawar        Stok:  5   Min: 10   Supplier: Sari Roti   │  │
  │  │ ☑ Terigu 1kg        Stok:  0   Min: 15   Supplier: Bogasari    │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  Group by Supplier:                                                   │
  │  ○ Buat 1 PO per supplier                                            │
  │  ● Buat 1 PO untuk semua (pilih supplier)                            │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Generate PO dengan   │
  │  suggested qty        │
  │  (stok max - stok     │
  │   saat ini)           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form PO    │
  │  (prefilled)          │
  │  User dapat adjust qty│
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 8. Keyboard Shortcuts

| Shortcut | Aksi                | Keterangan         |
| -------- | ------------------- | ------------------ |
| `Ctrl+N` | Buat PO baru        | Di halaman PO List |
| `Ctrl+S` | Simpan form         | Di form aktif      |
| `Ctrl+P` | Print / Preview     | Di detail PO/GRN   |
| `Ctrl+R` | Terima barang (GRN) | Di detail PO       |
| `Ctrl+F` | Fokus ke pencarian  | Di halaman list    |
| `Esc`    | Tutup modal/dialog  | Context-sensitive  |

---

## 9. Wireframes Reference

> **Lihat:** [Purchase Management Wireframes](./wireframes/05-purchase-management-wireframes.md)

| Wireframe                                                                                   | Deskripsi              |
| ------------------------------------------------------------------------------------------- | ---------------------- |
| [PO List](./wireframes/05-purchase-management-wireframes.md#1-purchase-order-list)          | Daftar PO              |
| [PO Form](./wireframes/05-purchase-management-wireframes.md#2-purchase-order-form)          | Form create/edit PO    |
| [Goods Receive](./wireframes/05-purchase-management-wireframes.md#3-goods-receive-form)     | Form penerimaan barang |
| [Supplier List](./wireframes/05-purchase-management-wireframes.md#4-supplier-list)          | Daftar supplier        |
| [AP Aging Report](./wireframes/05-purchase-management-wireframes.md#5-ap-aging-report)      | Laporan hutang         |
| [Supplier Form](./wireframes/05-purchase-management-wireframes.md#6-supplier-form)          | Form supplier          |
| [Payment Modal](./wireframes/05-purchase-management-wireframes.md#7-payment-modal)          | Modal bayar hutang     |
| [Purchase Return](./wireframes/05-purchase-management-wireframes.md#8-purchase-return-form) | Form retur pembelian   |
