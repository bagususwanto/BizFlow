# Product & Service Management User Flow

Dokumentasi alur pengguna untuk modul Manajemen Produk & Layanan BizFlow.

> 📌 **Wireframes:** Lihat [Product Management Wireframes](wireframes/03-product-management-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCT & SERVICE MANAGEMENT OVERVIEW                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Product    │  │  Category   │  │   Price     │  │   Stock     │        │
│  │    CRUD     │  │ Management  │  │   Level     │  │   Alert     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Fitur Utama:                                                               │
│  • Manajemen produk (barang & jasa)                                         │
│  • Kategori & sub-kategori produk                                           │
│  • SKU & barcode management                                                 │
│  • Multi-unit of measure (UoM)                                              │
│  • Price level (retail, grosir, member)                                     │
│  • Stock minimum alert                                                      │
│  • Foto produk & deskripsi                                                  │
│  • Import/export data produk                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Product CRUD Flow

### 2.1 Create Product Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CREATE PRODUCT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Tambah Produk"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Tambah Produk        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tab 1: INFORMASI DASAR                                               │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • Nama Produk *                                                      │
  │  • SKU *              (auto-generate atau manual)                     │
  │  • Barcode            (input / scan / generate EAN-13)                │
  │  • Tipe *             (○ Barang  ○ Jasa)                              │
  │  • Kategori *         (dropdown + add new)                            │
  │  • Sub-Kategori       (dropdown, filter by kategori)                  │
  │  • Merek              (dropdown + add new)                            │
  │  • Deskripsi          (rich text)                                     │
  │  • Status             (● Aktif  ○ Nonaktif)                           │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tab 2: HARGA & SATUAN                                                │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • Satuan Dasar *     (pcs, unit, kg, liter, dll)                     │
  │  • Harga Beli *       (modal)                                         │
  │  • Harga Jual *       (retail)                                        │
  │  • Margin %           (auto-calculate)                                │
  │                                                                       │
  │  Multi Price Level:                                                   │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │ Level      │ Min Qty │ Harga     │ Diskon                       │  │
  │  │ Retail     │    1    │ Rp 15.000 │ -                            │  │
  │  │ Grosir     │   12    │ Rp 13.500 │ 10%                          │  │
  │  │ Member     │    1    │ Rp 14.000 │ 6.67%                        │  │
  │  │ [ + Tambah Level ]                                              │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  │                                                                       │
  │  Multi Unit:                                                          │
  │  ┌─────────────────────────────────────────────────────────────────┐  │
  │  │ Satuan   │ Konversi      │ Harga Beli   │ Harga Jual            │  │
  │  │ pcs      │ 1 (base)      │ Rp 12.000    │ Rp 15.000             │  │
  │  │ lusin    │ 12 pcs        │ Rp 140.000   │ Rp 162.000            │  │
  │  │ karton   │ 48 pcs        │ Rp 550.000   │ Rp 648.000            │  │
  │  │ [ + Tambah Satuan ]                                             │  │
  │  └─────────────────────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tab 3: STOK & INVENTORI                                              │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • Track Stock        (☑ Ya - untuk barang, ☐ Tidak - untuk jasa)    │
  │  • Stok Awal          (jumlah saat ini)                               │
  │  • Stok Minimum *     (alert threshold)                               │
  │  • Stok Maksimum      (optional, untuk reorder)                       │
  │  • Lokasi Gudang      (dropdown multi-select)                         │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tab 4: MEDIA                                                         │
  │  ─────────────────────────────────────────────────────────────────    │
  │  • Foto Utama         (upload, max 2MB)                               │
  │  • Galeri             (multiple, max 5 foto)                          │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Simpan   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Gagal
  │  Validasi input       │─────────────────────┐
  └───────────┬───────────┘                     │
              │ Valid                           ▼
              │                    ┌───────────────────────┐
              │                    │  Tampilkan error      │
              │                    │  validasi             │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐     Duplicate
  │  Cek duplicate        │─────────────────────┐
  │  SKU / Barcode        │                     │
  └───────────┬───────────┘                     ▼
              │ Unique             ┌───────────────────────┐
              │                    │  "SKU/Barcode sudah   │
              │                    │   digunakan"          │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐
  │  Simpan produk ke     │
  │  database             │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "Produk berhasil     │
  │   ditambahkan"        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Redirect ke          │
  │  Product List         │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.2 Edit Product Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EDIT PRODUCT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Edit" pada produk
              │
              ▼
  ┌───────────────────────┐
  │  Load data produk     │
  │  dari database        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Edit Produk          │
  │  (prefilled)          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  ⚠️ Field yang TIDAK bisa diedit:                                     │
  │  • SKU (jika sudah ada transaksi)                                     │
  │  • Barcode (jika sudah ada transaksi)                                 │
  │                                                                       │
  │  ⚠️ Perubahan HARGA:                                                  │
  │  • Harga baru berlaku untuk transaksi baru                            │
  │  • Transaksi lama tetap menggunakan harga saat transaksi              │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Edit field yang      │
  │  diperlukan           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Update   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi & simpan    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat perubahan      │
  │  ke audit log         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "Produk berhasil     │
  │   diupdate"           │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.3 Delete/Deactivate Product Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DELETE/DEACTIVATE PRODUCT FLOW                         │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Hapus" pada produk
              │
              ▼
  ┌───────────────────────┐
  │  Cek apakah produk    │
  │  punya transaksi      │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Tidak ada         ▼ Ada transaksi
  ┌─────────┐     ┌───────────────────────┐
  │         │     │  Tampilkan warning:   │
  │         │     │  "Produk ini memiliki │
  │         │     │   transaksi. Produk   │
  │         │     │   akan dinonaktifkan  │
  │         │     │   (bukan dihapus)"    │
  │         │     └───────────┬───────────┘
  │         │                 │
  │         │                 ▼
  │         │     ┌───────────────────────┐
  │         │     │  Update status        │
  │         │     │  menjadi "Nonaktif"   │
  │         │     └───────────────────────┘
  │         │
  ▼         │
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  konfirmasi delete    │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Ya                ▼ Tidak
  ┌─────────┐     ┌───────────────────────┐
  │         │     │  Tutup dialog         │
  │         │     └───────────────────────┘
  ▼
  ┌───────────────────────┐
  │  Hapus produk dari    │
  │  database             │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "Produk berhasil     │
  │   dihapus"            │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.4 Duplicate Product Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DUPLICATE PRODUCT FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Duplikat" pada produk
              │
              ▼
  ┌───────────────────────┐
  │  Load data produk     │
  │  yang akan diduplikat │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Data yang DICOPY:                                                    │
  │  • Nama Produk + " (Copy)"                                            │
  │  • Tipe (Barang/Jasa)                                                 │
  │  • Kategori & Sub-kategori                                            │
  │  • Merek                                                              │
  │  • Deskripsi                                                          │
  │  • Harga Beli & Harga Jual                                            │
  │  • Multi Price Level                                                  │
  │  • Multi Unit                                                         │
  │  • Stok Minimum & Maksimum                                            │
  │  • Foto produk (referensi)                                            │
  │                                                                       │
  │  Data yang TIDAK dicopy (di-reset):                                   │
  │  • SKU (auto-generate baru)                                           │
  │  • Barcode (kosong atau generate baru)                                │
  │  • Stok Awal (set ke 0)                                               │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Buka form "Tambah    │
  │  Produk" dengan data  │
  │  pre-filled           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  User edit data yang  │
  │  perlu diubah:        │
  │  • Nama produk        │
  │  • Harga (jika beda)  │
  │  • dll                │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Simpan   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi & simpan    │
  │  sebagai produk BARU  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "Produk berhasil     │
  │   diduplikat"         │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.5 Stock History (Riwayat Stok) Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STOCK HISTORY FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Riwayat Stok" pada produk
              │
              ▼
  ┌───────────────────────┐
  │  Load riwayat         │
  │  perubahan stok       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tampilkan Modal Riwayat Stok:                                        │
  │                                                                       │
  │  Header:                                                              │
  │  • Nama Produk                                                        │
  │  • SKU                                                                │
  │  • Stok Saat Ini                                                      │
  │                                                                       │
  │  Filter:                                                              │
  │  • Periode (7 hari, 30 hari, 3 bulan, custom)                         │
  │  • Tipe transaksi (Semua, Jual, Terima, Return, Adjust)               │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Tabel Riwayat Stok:                                                  │
  │                                                                       │
  │  ┌──────────┬────────────┬──────────┬───────┬───────┬──────────┐      │
  │  │ Tanggal  │ Tipe       │ Referensi│ Qty   │ Saldo │ User     │      │
  │  ├──────────┼────────────┼──────────┼───────┼───────┼──────────┤      │
  │  │ 07/01/24 │ 📤 Jual    │ INV-0512 │ -5    │ 150   │ Kasir    │      │
  │  │ 06/01/24 │ 📥 Terima  │ GR-0089  │ +50   │ 155   │ Admin    │      │
  │  │ 05/01/24 │ ↩️ Return  │ RET-0015 │ +2    │ 105   │ Supv     │      │
  │  │ 04/01/24 │ 🔄 Adjust  │ ADJ-0023 │ -5    │ 103   │ Admin    │      │
  │  └──────────┴────────────┴──────────┴───────┴───────┴──────────┘      │
  │                                                                       │
  │  Tipe Transaksi:                                                      │
  │  • 📤 Jual: Penjualan ke customer (Invoice)                           │
  │  • 📥 Terima: Penerimaan dari supplier (Goods Receive)                │
  │  • ↩️ Return: Return dari customer                                    │
  │  • 🔄 Adjust: Penyesuaian stok (Stock Opname, Koreksi)                │
  │  • ➡️ Transfer: Transfer antar gudang                                 │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Ringkasan (periode terpilih):                                        │
  │  • Total Masuk  : +xxx pcs                                            │
  │  • Total Keluar : -xxx pcs                                            │
  │  • Netto        : ±xxx pcs                                            │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Aksi:                │
  │  • Export ke Excel    │
  │  • Tutup modal        │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 3. Category Management Flow

### 3.1 Category CRUD Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CATEGORY MANAGEMENT FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User akses menu "Kategori Produk"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan daftar     │
  │  kategori (tree view) │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Struktur Kategori (Tree):                                            │
  │                                                                       │
  │  📁 Makanan (25 produk)                                               │
  │    ├── 📁 Makanan Ringan (12)                                         │
  │    │     ├── Snack                                                    │
  │    │     └── Keripik                                                  │
  │    ├── 📁 Makanan Berat (8)                                           │
  │    └── 📁 Frozen Food (5)                                             │
  │  📁 Minuman (18 produk)                                               │
  │    ├── 📁 Minuman Botol (10)                                          │
  │    └── 📁 Minuman Sachet (8)                                          │
  │  📁 Toiletries (15 produk)                                            │
  │  📁 Lainnya (7 produk)                                                │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Tambah Kategori    │
  │  • Tambah Sub-Kategori│
  │  • Edit Kategori      │
  │  • Hapus Kategori     │
  │  • Pindah Kategori    │
  └───────────────────────┘
```

### 3.2 Create Category Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CREATE CATEGORY FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Tambah Kategori"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan modal      │
  │  Tambah Kategori      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Input:                                                               │
  │                                                                       │
  │  • Nama Kategori *                                                    │
  │  • Parent Kategori    (dropdown, kosong = root kategori)              │
  │  • Deskripsi          (optional)                                      │
  │  • Icon               (optional, emoji picker)                        │
  │  • Urutan Tampil      (number, untuk sorting)                         │
  │  • Status             (● Aktif  ○ Nonaktif)                           │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik Simpan          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Duplicate
  │  Cek duplicate nama   │─────────────────────┐
  │  di level yang sama   │                     │
  └───────────┬───────────┘                     ▼
              │ Unique             ┌───────────────────────┐
              │                    │  "Kategori dengan     │
              │                    │   nama tersebut sudah │
              │                    │   ada"                │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐
  │  Simpan kategori      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Refresh tree view    │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 4. Barcode/SKU Management

### 4.1 SKU Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SKU GENERATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  FORMAT SKU: [KATEGORI]-[BRAND]-[SEQUENCE]
  Contoh: MKN-ABC-0001

  [START] User di form Tambah Produk
              │
              ▼
  ┌───────────────────────┐
  │  Pilih mode SKU:      │
  │  ● Auto-generate      │
  │  ○ Input manual       │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Auto              ▼ Manual
  ┌─────────────┐     ┌───────────────────────┐
  │             │     │  User input SKU       │
  │             │     │  custom               │
  │             │     └───────────┬───────────┘
  │             │                 │
  ▼             │                 ▼
  ┌───────────────────────┐     ┌───────────────────────┐
  │  Generate SKU:        │     │  Validasi format &    │
  │  1. Ambil kode        │     │  cek duplicate        │
  │     kategori (3 char) │     └───────────────────────┘
  │  2. Ambil kode brand  │
  │     (3 char)          │
  │  3. Get next sequence │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Preview SKU:         │
  │  MKN-ABC-0025         │
  │  [Regenerate]         │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 4.2 Barcode Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BARCODE MANAGEMENT FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User di field Barcode
              │
              ▼
  ┌───────────────────────┐
  │  Pilih mode:          │
  │  ○ Scan barcode       │
  │  ○ Input manual       │
  │  ● Generate baru      │
  │  ○ Kosongkan          │
  └───────────┬───────────┘
              │
    ┌─────────┼─────────┬─────────────────┐
    │         │         │                 │
    ▼         ▼         ▼                 ▼
  [Scan]  [Manual]  [Generate]        [Kosong]
    │         │         │                 │
    ▼         ▼         ▼                 │
  ┌─────┐  ┌─────┐  ┌───────────────┐    │
  │Aktif│  │Input│  │Generate       │    │
  │kamera│  │13   │  │EAN-13:        │    │
  │atau │  │digit│  │8990123456789  │    │
  │scan-│  │     │  └───────────────┘    │
  │ner  │  │     │         │             │
  └──┬──┘  └──┬──┘         │             │
     │        │            │             │
     └────────┴────────────┴─────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi:            │
  │  • Format valid?      │
  │  • Belum digunakan?   │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Valid             ▼ Invalid/Duplicate
  ┌─────────┐     ┌───────────────────────┐
  │  Set    │     │  Tampilkan error      │
  │  barcode│     └───────────────────────┘
  └─────────┘
              │
              ▼
           [END]
```

### 4.3 Print Barcode Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRINT BARCODE FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User pilih produk dan klik "Cetak Barcode"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  Print Options        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Print Options:                                                       │
  │                                                                       │
  │  Template Label:                                                      │
  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                      │
  │  │ 38 x 25 mm  │ │ 50 x 25 mm  │ │ 50 x 30 mm  │                      │
  │  │  (3x8 col)  │ │  (2x8 col)  │ │  (2x7 col)  │                      │
  │  └─────────────┘ └─────────────┘ └─────────────┘                      │
  │                                                                       │
  │  Informasi yang ditampilkan:                                          │
  │  ☑ Barcode                                                            │
  │  ☑ Nama Produk                                                        │
  │  ☑ Harga                                                              │
  │  ☐ SKU                                                                │
  │                                                                       │
  │  Jumlah Cetak: [24___]                                                │
  │                                                                       │
  │  Preview:                                                             │
  │  ┌─────────────────────────┐                                          │
  │  │ ||||| |||| |||| |||||  │                                          │
  │  │    8990123456789        │                                          │
  │  │ Indomie Goreng          │                                          │
  │  │ Rp 3.500                │                                          │
  │  └─────────────────────────┘                                          │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik "Cetak"         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Generate PDF         │
  │  dengan label         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Buka print dialog    │
  │  browser / download   │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 5. Price Level Management

### 5.1 Price Level Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PRICE LEVEL CONFIGURATION                             │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin akses menu "Pengaturan > Price Level"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan daftar     │
  │  price level          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Default Price Levels:                                                │
  │                                                                       │
  │  ┌──────────┬──────────────┬───────────┬──────────────────────────┐   │
  │  │ Level    │ Min Qty      │ Discount  │ Berlaku untuk            │   │
  │  ├──────────┼──────────────┼───────────┼──────────────────────────┤   │
  │  │ Retail   │ 1            │ 0%        │ Semua customer           │   │
  │  │ Grosir   │ 12           │ 10%       │ Customer tipe "Grosir"   │   │
  │  │ Member   │ 1            │ 5%        │ Customer dengan member   │   │
  │  │ Reseller │ 24           │ 15%       │ Customer tipe "Reseller" │   │
  │  └──────────┴──────────────┴───────────┴──────────────────────────┘   │
  │                                                                       │
  │  [ + Tambah Price Level ]                                             │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Tambah Level       │
  │  • Edit Level         │
  │  • Hapus Level        │
  └───────────────────────┘
```

### 5.2 Apply Price Level to Product

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLY PRICE LEVEL TO PRODUCT                           │
└─────────────────────────────────────────────────────────────────────────────┘

  Saat transaksi di POS, harga otomatis ditentukan berdasarkan:

  1. Customer Type
  ─────────────────────────────────────────────────────────────────────────
  │  Customer dipilih → Cek tipe customer → Apply price level sesuai tipe │
  └────────────────────────────────────────────────────────────────────────

  2. Quantity
  ─────────────────────────────────────────────────────────────────────────
  │  Qty diinput → Cek min qty setiap level → Apply level tertinggi match │
  └────────────────────────────────────────────────────────────────────────

  Contoh:
  ┌────────────────────────────────────────────────────────────────────────┐
  │  Produk: Indomie Goreng                                                │
  │  Customer: PT ABC (tipe: Grosir)                                       │
  │  Qty: 24 pcs                                                           │
  │                                                                        │
  │  Penentuan harga:                                                      │
  │  1. Cek tipe customer → Grosir → Eligible untuk harga grosir           │
  │  2. Cek qty → 24 >= 12 (min qty grosir) → Match                        │
  │  3. Apply harga grosir: Rp 3.150 (diskon 10% dari Rp 3.500)            │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Stock Alert Configuration

### 6.1 Set Stock Alert Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SET STOCK ALERT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User edit produk / bulk edit
              │
              ▼
  ┌───────────────────────┐
  │  Set nilai:           │
  │  • Stok Minimum       │
  │  • Stok Maksimum      │
  │  (optional)           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Alert Configuration per Produk:                                      │
  │                                                                       │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ Produk       │ Stok Saat Ini │ Stok Min │ Stok Max │ Status   │   │
  │  ├──────────────┼───────────────┼──────────┼──────────┼──────────┤   │
  │  │ Indomie Goreng│     150       │    50    │   500    │ 🟢 OK    │   │
  │  │ Aqua 600ml   │      25       │    30    │   200    │ 🟡 Low   │   │
  │  │ Roti Tawar   │       5       │    10    │    50    │ 🔴 Critical│   │
  │  └──────────────┴───────────────┴──────────┴──────────┴──────────┘   │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan konfigurasi   │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 6.2 Stock Alert Notification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STOCK ALERT NOTIFICATION                               │
└─────────────────────────────────────────────────────────────────────────────┘

  Background process (cron job setiap 1 jam):

  ┌───────────────────────┐
  │  Scan semua produk    │
  │  dengan track stock   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Filter produk:       │
  │  stok <= stok minimum │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Ada produk low    ▼ Tidak ada
  ┌─────────┐         [END]
  │         │
  ▼
  ┌───────────────────────┐
  │  Kirim notifikasi:    │
  │  • Dashboard alert    │
  │  • Email (optional)   │
  │  • Push notification  │
  │    (optional)         │
  └───────────────────────┘

  Alert Level:
  🟡 Warning  : Stok <= min + 20%
  🔴 Critical : Stok <= min
  ⚫ Out      : Stok = 0
```

---

## 7. Import/Export Product

### 7.1 Import Product Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IMPORT PRODUCT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Import Produk"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  Import               │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Import Options:                                                      │
  │                                                                       │
  │  Step 1: Download Template                                            │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │  📥 Download Template Excel                                    │   │
  │  │  • Template kosong untuk produk baru                           │   │
  │  │  • Template dengan data existing (untuk update)                │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  Step 2: Upload File                                                  │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │  [ Pilih File... ] atau Drag & Drop                            │   │
  │  │  Format: .xlsx, .csv                                           │   │
  │  │  Max: 10MB                                                     │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  User upload file     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Parse & validate     │
  │  data                 │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Validation Result:                                                   │
  │                                                                       │
  │  ┌────────────────────────────────────────────────────────────────┐   │
  │  │ Total Rows   : 100                                             │   │
  │  │ Valid        : 95                                              │   │
  │  │ Warning      : 3  (akan di-skip)                               │   │
  │  │ Error        : 2  (wajib diperbaiki)                           │   │
  │  └────────────────────────────────────────────────────────────────┘   │
  │                                                                       │
  │  ⚠️ Errors:                                                           │
  │  Row 15: SKU "ABC-001" sudah ada                                      │
  │  Row 42: Kategori "Elektronik" tidak ditemukan                        │
  │                                                                       │
  │  [ Cancel ]  [ Import Valid Only ]  [ Fix & Re-upload ]               │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Proses import        │
  │  (background job)     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan hasil:     │
  │  "95 produk berhasil  │
  │   diimport"           │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 7.2 Export Product Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPORT PRODUCT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik "Export"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  Export Options       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Export Options:                                                      │
  │                                                                       │
  │  Format:                                                              │
  │  ● Excel (.xlsx)  ○ CSV (.csv)                                       │
  │                                                                       │
  │  Filter:                                                              │
  │  Kategori  : [Semua ▾]                                               │
  │  Status    : ● Semua  ○ Aktif saja  ○ Nonaktif saja                  │
  │  Stok      : ○ Semua  ○ Stok tersedia  ○ Stok habis                  │
  │                                                                       │
  │  Kolom yang diexport:                                                 │
  │  ☑ SKU        ☑ Nama       ☑ Kategori    ☑ Harga Beli                │
  │  ☑ Barcode    ☑ Deskripsi  ☑ Stok        ☑ Harga Jual                │
  │  ☐ Created At ☐ Updated At                                           │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik "Export"        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Generate file        │
  │  (background job)     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Download file        │
  │  otomatis             │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 8. Product Search & Filter

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCT SEARCH & FILTER                              │
└─────────────────────────────────────────────────────────────────────────────┘

  Search Modes:
  ─────────────────────────────────────────────────────────────────────────

  1. Quick Search (di Product List)
     • Search by: nama, SKU, barcode
     • Instant search (as-you-type)

  2. Advanced Filter
     ┌────────────────────────────────────────────────────────────────────┐
     │  Kategori     : [Semua ▾]                                         │
     │  Status       : ● Semua  ○ Aktif  ○ Nonaktif                      │
     │  Stok         : [___] - [___]                                     │
     │  Harga        : [___] - [___]                                     │
     │  Merek        : [Semua ▾]                                         │
     │  Tipe         : ● Semua  ○ Barang  ○ Jasa                         │
     │  Stock Status : ● Semua  ○ In Stock  ○ Low Stock  ○ Out of Stock  │
     │                                                                    │
     │  [ Reset Filter ]  [ Terapkan ]                                    │
     └────────────────────────────────────────────────────────────────────┘

  3. Barcode Scan (di POS atau Product Page)
     • Scan → Auto-find product → Show detail
```

---

## 9. Keyboard Shortcuts

| Shortcut | Aksi               | Keterangan              |
| -------- | ------------------ | ----------------------- |
| `Ctrl+N` | Tambah produk baru | Di halaman Product List |
| `Ctrl+S` | Simpan form        | Di form Create/Edit     |
| `Ctrl+F` | Fokus ke pencarian | Di halaman Product List |
| `Ctrl+I` | Import produk      | Di halaman Product List |
| `Ctrl+E` | Export produk      | Di halaman Product List |
| `Esc`    | Tutup modal/dialog | Context-sensitive       |
| `Enter`  | Submit form        | Di form aktif           |

---

## 10. Wireframes Reference

> **Lihat:** [Product Management Wireframes](./wireframes/03-product-management-wireframes.md)

| Wireframe                                                                                                     | Deskripsi                |
| ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| [Product List Screen](./wireframes/03-product-management-wireframes.md#1-product-list-screen)                 | Daftar produk            |
| [Product Form](./wireframes/03-product-management-wireframes.md#2-product-form)                               | Form tambah/edit (4 tab) |
| [Category Management](./wireframes/03-product-management-wireframes.md#3-category-management)                 | Tree kategori            |
| [Barcode Print Dialog](./wireframes/03-product-management-wireframes.md#4-barcode-print-dialog)               | Dialog cetak barcode     |
| [Import Product Dialog](./wireframes/03-product-management-wireframes.md#5-import-product-dialog)             | Dialog import            |
| [Stock Alert Dashboard](./wireframes/03-product-management-wireframes.md#6-stock-alert-dashboard)             | Alert stok rendah        |
| [Delete Product Confirmation](./wireframes/03-product-management-wireframes.md#7-delete-product-confirmation) | Konfirmasi hapus produk  |
| [Stock History Modal](./wireframes/03-product-management-wireframes.md#8-stock-history-modal)                 | Riwayat perubahan stok   |
| [Price Level Configuration](./wireframes/03-product-management-wireframes.md#9-price-level-configuration)     | Konfigurasi price level  |
| [Export Product Dialog](./wireframes/03-product-management-wireframes.md#10-export-product-dialog)            | Dialog export produk     |
