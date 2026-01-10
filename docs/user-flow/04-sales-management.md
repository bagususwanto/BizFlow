# Sales Management User Flow

Dokumentasi alur pengguna untuk modul Manajemen Penjualan BizFlow.

> 📌 **Wireframes:** Lihat [Sales Management Wireframes](wireframes/04-sales-management-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SALES MANAGEMENT OVERVIEW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Sales     │  │   Invoice   │  │  Customer   │  │   Sales     │        │
│  │   Order     │  │ Generation  │  │ Management  │  │   Return    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Fitur Utama:                                                               │
│  • Sales Order (SO) creation & management                                   │
│  • Quotation / Penawaran harga                                              │
│  • Invoice generation & tracking                                            │
│  • Customer database & credit limit                                         │
│  • Sales return / retur penjualan                                           │
│  • Payment tracking (piutang)                                               │
│  • Sales report & analytics                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Sales Order Flow

### 2.1 Create Sales Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREATE SALES ORDER FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Sales Order"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Sales Order baru     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  HEADER SALES ORDER                                                   │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. SO *           (auto-generate: SO-YYYYMMDD-XXXX)               │
  │  • Tanggal SO *       (default: hari ini)                             │
  │  • Customer *         (dropdown / search)                             │
  │  • Alamat Pengiriman  (dari customer / custom)                        │
  │  • Salesman           (dropdown)                                      │
  │  • Tanggal Kirim      (expected delivery date)                        │
  │  • Terms of Payment   (COD, 7 hari, 14 hari, 30 hari, dll)            │
  │  • Catatan            (internal notes)                                │
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
  │  │ 1 │ Indomie     │  24 │  pcs   │   3.500  │   10%  │   75.600 │    │
  │  │ 2 │ Aqua 600ml  │  48 │  pcs   │   4.000  │    5%  │  182.400 │    │
  │  │ 3 │ Teh Botol   │  12 │  pcs   │   5.000  │     -  │   60.000 │    │
  │  └───┴─────────────┴─────┴────────┴──────────┴────────┴──────────┘    │
  │                                                                       │
  │  [ + Tambah Item ]  [ 📋 Import dari Quotation ]                      │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  SUMMARY                                                              │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │                              Subtotal :       Rp    318.000           │
  │                              Diskon   :       Rp          -           │
  │                              PPN 11%  :       Rp     34.980           │
  │                              ─────────────────────────────            │
  │                              TOTAL    :       Rp    352.980           │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Simpan sebagai     │
  │    Draft              │
  │  • Simpan & Confirm   │
  │  • Simpan & Buat      │
  │    Invoice            │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Credit Limit
  │  Validasi:            │     Exceeded
  │  • Credit limit       │─────────────────────┐
  │  • Stok tersedia      │                     │
  └───────────┬───────────┘                     ▼
              │ OK                 ┌───────────────────────┐
              │                    │  Warning: Credit      │
              │                    │  limit terlampaui.    │
              │                    │  [Override] [Cancel]  │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐
  │  Simpan Sales Order   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "SO berhasil dibuat" │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.2 Sales Order Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SALES ORDER STATE DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────────────┘

                           Create SO
                               │
                               ▼
                       ┌───────────────┐
                       │    DRAFT      │
                       │  (Konsep)     │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         [Delete]         [Confirm]         [Edit]
              │                │                │
              ▼                ▼                │
         [DELETED]     ┌───────────────┐        │
                       │   CONFIRMED   │◀───────┘
                       │ (Dikonfirmasi)│
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          [Cancel]     [Create Invoice]    [Partial
              │                │            Delivery]
              ▼                ▼                │
       ┌───────────┐   ┌───────────────┐        │
       │ CANCELLED │   │   INVOICED    │◀───────┘
       └───────────┘   │ (Sudah Invoice)│
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        [Partial       [Full Payment]     [Return]
         Payment]            │                │
              │              ▼                ▼
              │        ┌───────────────┐  ┌─────────┐
              └───────▶│    COMPLETED  │  │ RETURNED│
                       │   (Selesai)   │  └─────────┘
                       └───────────────┘
```

### 2.3 View SO Detail Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VIEW SO DETAIL FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Lihat Detail" pada SO
              │
              ▼
  ┌───────────────────────┐
  │  Load data SO         │
  │  beserta relasi       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tampilkan SO Detail Page                                             │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │  HEADER                                                         │  │
  │  │  • No. SO, Tanggal, Status (badge)                              │  │
  │  │  • Customer info (nama, alamat, kontak)                         │  │
  │  │  • Salesman, Terms of Payment, Tanggal Pengiriman               │  │
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
  │  │  • Dikonfirmasi: 07 Jan 2024 14:00 - Supervisor                 │  │
  │  │  • Invoice dibuat: 08 Jan 2024 09:00 - Admin                    │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │  RELATED DOCUMENTS                                              │  │
  │  │  • Invoice: INV-20240108-001 (link)                             │  │
  │  │  • Delivery Order: DO-20240108-001 (link)                       │  │
  │  │  • Return: - (belum ada)                                        │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Available Actions:   │
  │  (sesuai status SO)   │
  │  • Edit (jika Draft)  │
  │  • Confirm            │
  │  • Buat Invoice       │
  │  • Print              │
  │  • Cancel             │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.4 Print SO Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRINT SO FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Print SO"
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

## 3. Quotation Flow

### 3.1 Create Quotation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CREATE QUOTATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Quotation"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Quotation baru       │
  │  (mirip Sales Order)  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Quotation spesifik fields:                                           │
  │                                                                       │
  │  • No. Quotation   (auto: QT-YYYYMMDD-XXXX)                           │
  │  • Masa Berlaku    (default: 14 hari)                                 │
  │  • Subject/Perihal                                                    │
  │  • Terms & Conditions                                                 │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Quotation     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Preview PDF        │
  │  • Kirim ke Customer  │
  │    (Email/WhatsApp)   │
  │  • Convert to SO      │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 3.2 Quotation to Sales Order

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      QUOTATION TO SALES ORDER FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Convert to SO" pada Quotation
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  konfirmasi           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Copy data quotation  │
  │  ke Sales Order baru  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form SO    │
  │  (prefilled dari      │
  │   quotation)          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  User dapat edit      │
  │  jika perlu           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan SO            │
  │  Update status        │
  │  quotation = "Won"    │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 4. Invoice Flow

### 4.1 Generate Invoice Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GENERATE INVOICE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Invoice" dari Sales Order
              │
              ▼
  ┌───────────────────────┐
  │  Cek status SO        │
  │  (harus Confirmed)    │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Confirmed         ▼ Not Confirmed
  ┌─────────┐     ┌───────────────────────┐
  │         │     │  Error: SO harus      │
  │         │     │  dikonfirmasi dulu    │
  │         │     └───────────────────────┘
  ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Invoice              │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  INVOICE DATA                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Invoice *      (auto: INV-YYYYMMDD-XXXX)                       │
  │  • Tanggal Invoice    (default: hari ini)                             │
  │  • Jatuh Tempo        (berdasarkan Terms of Payment SO)               │
  │  • Reference SO       (link ke SO)                                    │
  │                                                                       │
  │  Items: (copy dari SO, bisa partial)                                  │
  │  ┌───────────────────────────────────────────────────────────────┐    │
  │  │ ☑ Indomie Goreng    - 24 pcs  @ 3.500  = 75.600               │    │
  │  │ ☑ Aqua 600ml        - 48 pcs  @ 4.000  = 182.400              │    │
  │  │ ☐ Teh Botol         - 12 pcs  @ 5.000  = 60.000 (uncheck)     │    │
  │  └───────────────────────────────────────────────────────────────┘    │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Invoice       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update status SO     │
  │  → INVOICED           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Preview PDF        │
  │  • Print Invoice      │
  │  • Kirim ke Customer  │
  │  • Terima Pembayaran  │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 4.2 Payment Receipt Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT RECEIPT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Terima Pembayaran" dari Invoice
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan modal      │
  │  Payment Receipt      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  PAYMENT DETAILS                                                      │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Invoice: INV-20240107-0001                                           │
  │  Total Invoice: Rp 352.980                                            │
  │  Sudah Dibayar: Rp 0                                                  │
  │  Sisa         : Rp 352.980                                            │
  │                                                                       │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Tanggal Bayar *                                                      │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ 07 Jan 2024                                                    │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Jumlah Bayar *                                                       │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ Rp 352.980                              [Bayar Penuh]          │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Metode Pembayaran *                                                  │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ ● Cash  ○ Transfer Bank  ○ QRIS  ○ Giro                        │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Referensi (No. Rekening/Giro)                                        │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │                                                                │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Catatan                                                              │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │                                                                │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Payment       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Partial
  │  Cek apakah lunas?    │─────────────────────┐
  └───────────┬───────────┘                     │
              │ Lunas                           ▼
              │                    ┌───────────────────────┐
              │                    │  Update Invoice:      │
              │                    │  Status = Partial     │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐
  │  Update Invoice:      │
  │  Status = Paid        │
  │                       │
  │  Update SO:           │
  │  Status = Completed   │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 5. Customer Management Flow

### 5.1 Customer CRUD Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER CRUD FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Tambah Customer"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Customer baru        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  INFORMASI CUSTOMER                                                   │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Tipe Customer *      ○ Personal  ● Perusahaan                        │
  │                                                                       │
  │  Nama Customer *      ┌───────────────────────────────────────────┐   │
  │                       │ PT Maju Jaya                              │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Kode Customer        ┌───────────────────────────────────────────┐   │
  │  (auto/manual)        │ CUST-0025                                 │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Email               Phone                  Fax                       │
  │  ┌─────────────────┐ ┌─────────────────┐    ┌─────────────────┐       │
  │  │ info@majujaya   │ │ 021-5551234     │    │ 021-5551235     │       │
  │  └─────────────────┘ └─────────────────┘    └─────────────────┘       │
  │                                                                       │
  │  NPWP                                                                 │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ 01.234.567.8-012.000                                           │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Alamat Penagihan *                                                   │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ Jl. Sudirman No. 123, Jakarta Pusat 10110                      │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Alamat Pengiriman    ☑ Sama dengan alamat penagihan                  │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  PENGATURAN KREDIT & HARGA                                            │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Tipe Harga *         ┌───────────────────────────────────────────┐   │
  │                       │ Grosir                                  ▾ │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Credit Limit         ┌───────────────────────────────────────────┐   │
  │                       │ Rp 50.000.000                             │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Terms of Payment     ┌───────────────────────────────────────────┐   │
  │                       │ 30 Hari                                 ▾ │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  │  Salesman Assigned    ┌───────────────────────────────────────────┐   │
  │                       │ Andi Prasetyo                           ▾ │   │
  │                       └───────────────────────────────────────────┘   │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Customer      │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 5.2 Credit Limit Check Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREDIT LIMIT CHECK FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  Saat membuat Sales Order / Invoice:

  ┌───────────────────────┐
  │  Pilih Customer       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Load customer info:  │
  │  • Credit Limit       │
  │  • Outstanding AR     │
  │    (Piutang)          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Hitung:              │
  │  Available Credit =   │
  │  Credit Limit -       │
  │  Outstanding AR -     │
  │  Current Order        │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Available >= 0    ▼ Available < 0
  ┌─────────┐     ┌───────────────────────┐
  │  OK ✓   │     │  ⚠️ Warning:          │
  │  Proceed│     │  Credit limit         │
  │         │     │  terlampaui           │
  │         │     │                       │
  │         │     │  Credit Limit: 50jt   │
  │         │     │  Outstanding:  45jt   │
  │         │     │  Order ini:    10jt   │
  │         │     │  Over limit:    5jt   │
  │         │     │                       │
  │         │     │  [Cancel] [Override]  │
  │         │     │  (perlu approval)     │
  │         │     └───────────────────────┘
  │         │
  ▼         │
  [Continue]│
```

---

## 6. Sales Return Flow

### 6.1 Create Sales Return Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREATE SALES RETURN FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Buat Retur" dari Invoice
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Sales Return         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  RETURN HEADER                                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • No. Return         (auto: RET-YYYYMMDD-XXXX)                       │
  │  • Ref. Invoice       (link ke invoice asal)                          │
  │  • Tanggal Return     (default: hari ini)                             │
  │  • Alasan Return      (dropdown + text)                               │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  RETURN ITEMS                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ Produk          │ Qty Jual │ Qty Return │ Harga    │ Subtotal  │   │
  │  ├─────────────────┼──────────┼────────────┼──────────┼───────────┤   │
  │  │ ☑ Indomie       │    24    │     4      │   3.500  │   14.000  │   │
  │  │ ☐ Aqua 600ml    │    48    │     -      │   4.000  │        -  │   │
  │  │ ☑ Teh Botol     │    12    │    12      │   5.000  │   60.000  │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Alasan per item:                                                     │
  │  • Indomie: Kemasan rusak                                             │
  │  • Teh Botol: Expired                                                 │
  │                                                                       │
  │                              Total Return : Rp 74.000                 │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  RETURN ACTION                                                        │
  │  ─────────────────────────────────────────────────────────────────    │
  │                                                                       │
  │  Aksi untuk nilai return:                                             │
  │  ● Potong dari piutang (jika masih ada)                               │
  │  ○ Refund cash                                                        │
  │  ○ Credit note (untuk pembelian selanjutnya)                          │
  │                                                                       │
  │  Aksi untuk barang:                                                   │
  │  ● Kembali ke stok (kondisi baik)                                     │
  │  ○ Tidak kembali ke stok (rusak/expired)                              │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan Return        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update:              │
  │  • Invoice status     │
  │  • Stok produk        │
  │  • Piutang customer   │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 7. Accounts Receivable (Piutang) Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ACCOUNTS RECEIVABLE OVERVIEW                           │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User akses menu "Piutang"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  AR AGING SUMMARY                                                     │
  │                                                                       │
  │  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────┐  │
  │  │  Current    │  1-30 hari  │  31-60 hari │  61-90 hari │  >90    │  │
  │  │  (Belum JT) │  (Overdue)  │  (Overdue)  │  (Overdue)  │  hari   │  │
  │  ├─────────────┼─────────────┼─────────────┼─────────────┼─────────┤  │
  │  │ 25.500.000  │ 12.300.000  │  5.200.000  │  2.100.000  │ 800.000 │  │
  │  └─────────────┴─────────────┴─────────────┴─────────────┴─────────┘  │
  │                                                                       │
  │  Total Piutang: Rp 45.900.000                                         │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  AR LIST (By Customer)                                                │
  │                                                                       │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ Customer       │ Total Piutang │ Current │ Overdue │ Action    │   │
  │  ├────────────────┼───────────────┼─────────┼─────────┼───────────┤   │
  │  │ PT Maju Jaya   │    15.500.000 │  10.5jt │    5jt  │ [Detail]  │   │
  │  │ Toko Berkah    │     8.200.000 │   8.2jt │     -   │ [Detail]  │   │
  │  │ CV Sejahtera   │    12.000.000 │   6.8jt │   5.2jt │ [Detail]  │   │
  │  └────────────────┴───────────────┴─────────┴─────────┴───────────┘   │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Lihat detail       │
  │  • Terima pembayaran  │
  │  • Kirim reminder     │
  │  • Export aging report│
  └───────────────────────┘
```

---

## 8. Keyboard Shortcuts

| Shortcut | Aksi                  | Keterangan           |
| -------- | --------------------- | -------------------- |
| `Ctrl+N` | Buat Sales Order baru | Di halaman SO List   |
| `Ctrl+Q` | Buat Quotation baru   | Di halaman Quotation |
| `Ctrl+S` | Simpan form           | Di form aktif        |
| `Ctrl+P` | Print / Preview       | Di detail SO/Invoice |
| `Ctrl+F` | Fokus ke pencarian    | Di halaman list      |
| `Esc`    | Tutup modal/dialog    | Context-sensitive    |
| `F2`     | Edit item terpilih    | Di detail SO         |

---

## 9. Wireframes Reference

> **Lihat:** [Sales Management Wireframes](./wireframes/04-sales-management-wireframes.md)

| Wireframe                                                                               | Deskripsi             |
| --------------------------------------------------------------------------------------- | --------------------- |
| [Sales Order List](./wireframes/04-sales-management-wireframes.md#1-sales-order-list)   | Daftar SO             |
| [Sales Order Form](./wireframes/04-sales-management-wireframes.md#2-sales-order-form)   | Form create/edit SO   |
| [Invoice Detail](./wireframes/04-sales-management-wireframes.md#3-invoice-detail)       | Detail invoice        |
| [Customer List](./wireframes/04-sales-management-wireframes.md#4-customer-list)         | Daftar customer       |
| [Customer Form](./wireframes/04-sales-management-wireframes.md#5-customer-form)         | Form customer         |
| [AR Aging Report](./wireframes/04-sales-management-wireframes.md#6-ar-aging-report)     | Laporan piutang       |
| [Quotation Form](./wireframes/04-sales-management-wireframes.md#7-quotation-form)       | Form quotation        |
| [Sales Return Form](./wireframes/04-sales-management-wireframes.md#8-sales-return-form) | Form return penjualan |
| [Payment Modal](./wireframes/04-sales-management-wireframes.md#9-payment-modal)         | Modal pembayaran      |
