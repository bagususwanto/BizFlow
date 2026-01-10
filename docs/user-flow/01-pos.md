# Point of Sale (POS) User Flow

Dokumentasi alur pengguna untuk modul Point of Sale BizFlow.

> 📌 **Wireframes:** Lihat [POS Wireframes](wireframes/01-pos-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview POS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            POS MODULE OVERVIEW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │   Quick     │    │   Payment   │    │   Hold &    │    │   Return/   │  │
│   │   Sale      │    │   Process   │    │   Resume    │    │   Refund    │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                              │
│   Fitur Utama:                                                               │
│   • Transaksi cepat dengan barcode scanner                                   │
│   • Pencarian produk dengan nama/SKU                                         │
│   • Multiple payment (Cash, QRIS, Transfer, Split)                           │
│   • Hold transaksi sementara                                                 │
│   • Return/Refund                                                            │
│   • Cetak struk (thermal printer)                                            │
│   • Mode offline                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Quick Sale Flow

### 2.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            QUICK SALE FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Kasir buka halaman POS
              │
              ▼
  ┌───────────────────────┐
  │  POS Main Screen      │
  │  (Keranjang kosong)   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────┐
  │  Pilih metode input produk:           │
  │                                       │
  │  ┌─────────────┐  ┌─────────────┐     │
  │  │  Scan       │  │  Cari       │     │
  │  │  Barcode    │  │  Manual     │     │
  │  └──────┬──────┘  └──────┬──────┘     │
  └─────────┼────────────────┼────────────┘
            │                │
            ▼                ▼
  ┌─────────────────┐  ┌─────────────────┐
  │ Scanner aktif,  │  │ Ketik nama/SKU  │
  │ tunggu scan     │  │ di search box   │
  └────────┬────────┘  └────────┬────────┘
           │                    │
           │    ┌───────────────┘
           │    │
           ▼    ▼
  ┌───────────────────────┐
  │  Produk ditemukan?    │
  └───────────┬───────────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
    [Ya]            [Tidak]
      │               │
      ▼               ▼
  ┌─────────────┐  ┌─────────────────────┐
  │ Tambah ke   │  │ Tampilkan pesan:    │
  │ keranjang   │  │ "Produk tidak       │
  │ (qty: 1)    │  │  ditemukan"         │
  └──────┬──────┘  └─────────────────────┘
         │
         ▼
  ┌───────────────────────┐
  │  Update keranjang:    │
  │  • Tampilkan item     │
  │  • Hitung subtotal    │
  │  • Hitung total       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Lanjut tambah item   │◄────────┐
  │  atau proses bayar?   │         │
  └───────────┬───────────┘         │
              │                     │
      ┌───────┴───────┐             │
      │               │             │
      ▼               ▼             │
  [Tambah]        [Bayar]           │
      │               │             │
      └───────────────┼─────────────┘
                      │
                      ▼
              [Payment Flow]
```

### 2.2 Mengubah Quantity

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          UPDATE QUANTITY FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Item sudah di keranjang
              │
              ▼
  ┌───────────────────────┐
  │  Klik item di         │
  │  keranjang            │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────┐
  │  Pilih aksi:                              │
  │                                           │
  │  [+] Tambah qty    (atau tekan +)         │
  │  [-] Kurang qty    (atau tekan -)         │
  │  [🗑] Hapus item    (atau tekan Del)       │
  │  [✏️] Edit qty manual                      │
  │                                           │
  └───────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update total         │
  │  keranjang            │
  └───────────────────────┘
```

---

## 3. Payment Flow

### 3.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PAYMENT FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Klik tombol "Bayar"
              │
              ▼
  ┌───────────────────────┐
  │  Buka Payment Modal   │
  │  • Tampilkan total    │
  │  • Pilih metode bayar │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                     PILIH METODE PEMBAYARAN                        │
  │                                                                    │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
  │  │   💵 Cash   │  │   📱 QRIS   │  │  🏦 Transfer │  │  💳 Split │ │
  │  │   (F8)      │  │   (F9)      │  │             │  │   Payment │ │
  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │
  └─────────┼────────────────┼────────────────┼───────────────┼───────┘
            │                │                │               │
            ▼                ▼                ▼               ▼
  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
  │ Input nominal   │ │ Tampilkan QR    │ │ Tampilkan   │ │ Kombinasi   │
  │ yang diterima   │ │ code QRIS       │ │ info bank   │ │ beberapa    │
  │                 │ │                 │ │ & nominal   │ │ metode      │
  └────────┬────────┘ └────────┬────────┘ └──────┬──────┘ └──────┬──────┘
           │                   │                 │               │
           ▼                   ▼                 ▼               ▼
  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
  │ Hitung kembalian│ │ Tunggu konfirm  │ │ Tunggu      │ │ Input per   │
  │ Cash - Total    │ │ pembayaran      │ │ konfirmasi  │ │ metode      │
  └────────┬────────┘ └────────┬────────┘ └──────┬──────┘ └──────┬──────┘
           │                   │                 │               │
           └───────────────────┴─────────────────┴───────────────┘
                                       │
                                       ▼
                          ┌───────────────────────┐
                          │  Konfirmasi Pembayaran │
                          │  [ Proses Transaksi ]  │
                          └───────────┬───────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │  Simpan transaksi     │
                          │  ke database          │
                          └───────────┬───────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │  Cetak struk?         │
                          └───────────┬───────────┘
                                      │
                              ┌───────┴───────┐
                              │               │
                              ▼               ▼
                            [Ya]            [Tidak]
                              │               │
                              ▼               │
                          ┌─────────────┐     │
                          │ Print struk │     │
                          │ (thermal)   │     │
                          └──────┬──────┘     │
                                 │            │
                                 └─────┬──────┘
                                       │
                                       ▼
                          ┌───────────────────────┐
                          │  Transaksi selesai!   │
                          │  Reset keranjang      │
                          └───────────────────────┘
```

### 3.2 Cash Payment Detail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CASH PAYMENT FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  Total: Rp 150.000
              │
              ▼
  ┌───────────────────────────────────────────┐
  │  Quick Amount Buttons:                    │
  │                                           │
  │  [Rp 150.000] [Rp 200.000] [Rp 250.000]   │
  │  (Uang pas)                               │
  │                                           │
  │  [Rp 100.000] [Rp 50.000]  [Rp 20.000]    │
  │                                           │
  │  Input manual: [____________]              │
  │                                           │
  └───────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────┐
  │  Diterima : Rp 200.000                    │
  │  Total    : Rp 150.000                    │
  │  ─────────────────────                    │
  │  Kembalian: Rp  50.000                    │
  │                                           │
  │           [ Proses Pembayaran ]            │
  └───────────────────────────────────────────┘
```

### 3.3 QRIS Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QRIS PAYMENT FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Pilih metode QRIS (F9)
              │
              ▼
  ┌───────────────────────┐
  │  Generate QR Code     │
  │  dari payment gateway │
  │  (Midtrans/Xendit)    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  📱 TAMPILKAN QR CODE                                              │
  │                                                                    │
  │  • QR Code QRIS standar                                            │
  │  • Total: Rp 87.500                                                │
  │  • Waktu berlaku: 5 menit                                          │
  │  • Supported: GoPay, OVO, DANA, ShopeePay, Bank                    │
  │                                                                    │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Customer scan QR     │
  │  dengan aplikasi      │
  │  pembayaran mereka    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Polling status       │
  │  pembayaran           │
  │  (setiap 3 detik)     │
  └───────────┬───────────┘
              │
      ┌───────┴───────┬───────────────┐
      │               │               │
      ▼               ▼               ▼
  [Sukses]        [Timeout]       [Cancel]
      │               │               │
      ▼               ▼               ▼
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │ Transaksi   │ │ QR expired  │ │ Kembali ke  │
  │ selesai!    │ │ Generate    │ │ pilihan     │
  │ Cetak struk │ │ ulang?      │ │ payment     │
  └─────────────┘ └─────────────┘ └─────────────┘
```

### 3.4 Transfer Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRANSFER PAYMENT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Pilih metode Transfer
              │
              ▼
  ┌───────────────────────┐
  │  Pilih Bank Tujuan    │
  │  • BCA                │
  │  • Mandiri            │
  │  • BNI / BRI          │
  │  • Lainnya            │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  📋 TAMPILKAN INFO REKENING                                        │
  │                                                                    │
  │  Bank      : BCA                                                   │
  │  No. Rek   : 123-456-7890                                          │
  │  Atas Nama : TOKO MAKMUR JAYA                                      │
  │  Nominal   : Rp 87.500                                             │
  │                                                                    │
  │  [ 📋 Copy No. Rek ]  [ 📋 Copy Nominal ]                          │
  │                                                                    │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Customer transfer    │
  │  via mobile/internet  │
  │  banking              │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Konfirmasi manual    │
  │  oleh kasir           │
  │  (cek mutasi/bukti)   │
  └───────────┬───────────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
  [Sudah]         [Belum]
      │               │
      ▼               ▼
  ┌─────────────┐ ┌─────────────┐
  │ Transaksi   │ │ Tunggu atau │
  │ selesai!    │ │ ganti metode│
  │ Cetak struk │ │ pembayaran  │
  └─────────────┘ └─────────────┘
```

### 3.5 Split Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SPLIT PAYMENT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Pilih Split Payment
              │
              ▼
  ┌───────────────────────┐
  │  Total: Rp 250.000    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  TAMBAH METODE PEMBAYARAN #1                                       │
  │                                                                    │
  │  • Pilih metode: Cash                                              │
  │  • Nominal: Rp 150.000                                             │
  │                                                                    │
  │  [ + Tambah Metode Lain ]                                          │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  TAMBAH METODE PEMBAYARAN #2                                       │
  │                                                                    │
  │  • Pilih metode: QRIS                                              │
  │  • Nominal: Rp 100.000                                             │
  │                                                                    │
  │  Sisa yang harus dibayar: Rp 0 ✅                                  │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi:            │
  │  Total pembayaran >=  │
  │  Total transaksi      │
  └───────────┬───────────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
   [Valid]        [Kurang]
      │               │
      ▼               ▼
  ┌─────────────┐ ┌─────────────────────┐
  │ Proses      │ │ Warning: tambah     │
  │ masing2     │ │ pembayaran atau     │
  │ payment     │ │ kurangi nominal     │
  └──────┬──────┘ └─────────────────────┘
         │
         ▼
  ┌───────────────────────┐
  │  Cash: diterima ✅     │
  │  QRIS: scan QR... ⏳   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Semua payment done   │
  │  Transaksi selesai!   │
  │  Cetak struk          │
  └───────────────────────┘
```

---

## 4. Hold & Resume Transaction

### 4.1 Hold Transaction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HOLD TRANSACTION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Keranjang ada item, tapi customer mau ambil barang lain
              │
              ▼
  ┌───────────────────────┐
  │  Tekan F5 atau klik   │
  │  tombol "Hold"        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Input catatan        │
  │  (opsional):          │
  │  "Pak Budi - ambil    │
  │   sayuran dulu"       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Simpan ke            │
  │  Held Transactions    │
  │  (max 10 transaksi)   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Reset keranjang      │
  │  Siap transaksi baru  │
  └───────────────────────┘
```

### 4.2 Resume Transaction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESUME TRANSACTION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Tekan F6 atau klik "Transaksi Ditahan"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                    DAFTAR TRANSAKSI DITAHAN                        │
  │                                                                    │
  │  ┌─────────────────────────────────────────────────────────────┐  │
  │  │ #1 │ 14:30 │ 5 items │ Rp 250.000 │ "Pak Budi - sayuran"   │  │
  │  ├─────────────────────────────────────────────────────────────┤  │
  │  │ #2 │ 14:35 │ 3 items │ Rp 125.000 │ "Ibu Ani"              │  │
  │  ├─────────────────────────────────────────────────────────────┤  │
  │  │ #3 │ 14:40 │ 8 items │ Rp 450.000 │ (tanpa catatan)        │  │
  │  └─────────────────────────────────────────────────────────────┘  │
  │                                                                    │
  │  [ Resume ]  [ Hapus ]  [ Batal ]                                  │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih transaksi      │
  │  yang akan dilanjut   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Restore ke keranjang │
  │  Hapus dari daftar    │
  │  held                 │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Lanjutkan transaksi  │
  │  seperti biasa        │
  └───────────────────────┘
```

---

## 5. Return/Refund Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RETURN/REFUND FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Customer ingin retur barang
              │
              ▼
  ┌───────────────────────┐
  │  Buka menu Retur      │
  │  /pos/returns         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Cari transaksi asli: │
  │  • Scan struk         │
  │  • Input nomor nota   │
  │  • Cari by tanggal    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                    DETAIL TRANSAKSI ASLI                           │
  │                                                                    │
  │  Nota: TRX-20240107-001          Tanggal: 07 Jan 2024 14:30        │
  │  ─────────────────────────────────────────────────────────────     │
  │  │ No │ Produk          │ Qty │ Harga    │ Subtotal  │ Retur │    │
  │  ├────┼─────────────────┼─────┼──────────┼───────────┼───────┤    │
  │  │ 1  │ Indomie Goreng  │  5  │   3.500  │   17.500  │ [ 2 ] │    │
  │  │ 2  │ Aqua 600ml      │ 10  │   4.000  │   40.000  │ [   ] │    │
  │  │ 3  │ Roti Tawar      │  2  │  15.000  │   30.000  │ [ 1 ] │    │
  │  └────┴─────────────────┴─────┴──────────┴───────────┴───────┘    │
  │                                                                    │
  │  Total Retur: Rp 22.000 (2x Indomie + 1x Roti)                     │
  │                                                                    │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Input alasan retur:  │
  │  ○ Barang rusak       │
  │  ○ Salah beli         │
  │  ○ Kadaluarsa         │
  │  ○ Lainnya: [____]    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih metode refund: │
  │  ○ Tunai              │
  │  ○ Tukar barang       │
  │  ○ Voucher            │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Proses retur         │
  │  • Update stok (+)    │
  │  • Simpan record      │
  │  • Proses refund      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Cetak bukti retur    │
  └───────────────────────┘
```

---

## 6. Discount Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DISCOUNT FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Tekan F4 atau klik "Diskon"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                       PILIH TIPE DISKON                            │
  │                                                                    │
  │  ┌───────────────────┐   ┌───────────────────┐                    │
  │  │  DISKON ITEM      │   │  DISKON TRANSAKSI │                    │
  │  │  (per produk)     │   │  (keseluruhan)    │                    │
  │  └─────────┬─────────┘   └─────────┬─────────┘                    │
  └────────────┼───────────────────────┼──────────────────────────────┘
               │                       │
               ▼                       ▼
  ┌───────────────────────┐  ┌───────────────────────┐
  │ Pilih item di cart    │  │ Input nilai diskon:   │
  │ yang mau didiskon     │  │                       │
  └───────────┬───────────┘  │ ○ Persen: [__]%       │
              │              │ ○ Nominal: Rp [____]  │
              ▼              │                       │
  ┌───────────────────────┐  │ Alasan: [__________]  │
  │ Input nilai diskon:   │  │ (opsional)            │
  │                       │  └───────────┬───────────┘
  │ ○ Persen: [__]%       │              │
  │ ○ Nominal: Rp [____]  │              │
  └───────────┬───────────┘              │
              │                          │
              └──────────┬───────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │ Update total dengan   │
              │ diskon applied        │
              └───────────────────────┘
```

---

## 7. Customer Selection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CUSTOMER SELECTION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Tekan F3 atau klik "Pilih Customer"
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                      CARI CUSTOMER                                 │
  │                                                                    │
  │  🔍 [_________________________]  [ + Tambah Baru ]                 │
  │                                                                    │
  │  ┌─────────────────────────────────────────────────────────────┐  │
  │  │ Nama          │ HP            │ Tipe     │ Saldo Kredit     │  │
  │  ├───────────────┼───────────────┼──────────┼──────────────────┤  │
  │  │ Budi Santoso  │ 0812-xxx-xxxx │ Retail   │ Rp 0             │  │
  │  │ Toko Makmur   │ 0813-xxx-xxxx │ Grosir   │ Rp 500.000       │  │
  │  │ PT ABC        │ 021-xxx-xxx   │ Corporate│ Rp 2.500.000     │  │
  │  └─────────────────────────────────────────────────────────────┘  │
  │                                                                    │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Pilih customer        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │ Customer terpilih: Toko Makmur                                     │
  │ • Tipe harga: Grosir (diskon 10%)                                  │
  │ • Sisa kredit: Rp 500.000                                          │
  │                                                                    │
  │ [ Ganti Customer ]  [ Hapus Customer ]                             │
  └───────────────────────────────────────────────────────────────────┘
```

---

## 8. Transaction History Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TRANSACTION HISTORY FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Buka menu Riwayat Transaksi (/pos/transactions)
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  HALAMAN RIWAYAT TRANSAKSI                                         │
  │                                                                    │
  │  • Filter tanggal (default: hari ini)                              │
  │  • Filter status (Sukses, Retur, Batal)                            │
  │  • Search by nota / customer                                       │
  │                                                                    │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan daftar     │
  │  transaksi dengan     │
  │  pagination           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  PILIH AKSI                                                        │
  │                                                                    │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
  │  │ 👁️ Lihat    │  │ 🖨️ Cetak    │  │ 🔄 Retur    │                │
  │  │   Detail    │  │   Ulang     │  │   Barang    │                │
  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
  └─────────┼────────────────┼────────────────┼───────────────────────┘
            │                │                │
            ▼                ▼                ▼
  ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
  │ Buka modal      │ │ Print struk │ │ Buka halaman│
  │ detail transaksi│ │ (thermal)   │ │ retur       │
  │ • Info nota     │ │             │ │             │
  │ • List item     │ │             │ │             │
  │ • Pembayaran    │ │             │ │             │
  └─────────────────┘ └─────────────┘ └─────────────┘
```

---

## 9. Offline Mode Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OFFLINE MODE FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Koneksi internet terputus
              │
              ▼
  ┌───────────────────────┐
  │  Deteksi offline      │
  │  (network check)      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  📴 MODE OFFLINE AKTIF                                             │
  │                                                                    │
  │  Fitur yang tetap berfungsi:                                       │
  │  ✅ Transaksi penjualan                                            │
  │  ✅ Tambah item ke keranjang                                       │
  │  ✅ Pembayaran cash                                                │
  │  ✅ Cetak struk                                                    │
  │  ✅ Lihat produk (cached)                                          │
  │                                                                    │
  │  Fitur yang terbatas:                                              │
  │  ⚠️ Pembayaran QRIS (perlu verifikasi)                             │
  │  ⚠️ Sync data ke server pusat                                      │
  │  ⚠️ Update stok real-time                                          │
  │                                                                    │
  └───────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Transaksi disimpan    │
  │ ke local database     │
  │ (SQLite/IndexedDB)    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Masuk ke Sync Queue   │
  │ (pending sync)        │
  └───────────┬───────────┘
              │
              ▼
  [Tunggu koneksi pulih]
              │
              ▼
  ┌───────────────────────┐
  │  Koneksi online       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Auto-sync ke server   │
  │ • Upload transaksi    │
  │ • Update stok         │
  │ • Download update     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Sync complete! ✅      │
  └───────────────────────┘
```

---

## 10. State Diagram - Transaction Status

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRANSACTION STATE DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │      IDLE       │ (Keranjang kosong)
                    └────────┬────────┘
                             │ Add item
                             ▼
                    ┌─────────────────┐
            ┌──────│    IN_CART      │◄─────┐
            │       │  (Ada item)     │      │
            │       └────────┬────────┘      │
            │                │               │
            │ Hold (F5)      │ Bayar (F10)   │ Resume (F6)
            │                │               │
            ▼                ▼               │
    ┌───────────────┐  ┌───────────────┐     │
    │     HELD      │  │  PROCESSING   │     │
    │  (Ditahan)    │──│  (Pembayaran) │     │
    └───────────────┘  └───────┬───────┘     │
                               │             │
                    Success    │    Cancel   │
                    ┌──────────┴──────────┐  │
                    │                     │  │
                    ▼                     ▼  │
           ┌─────────────────┐    ┌─────────────────┐
           │   COMPLETED     │    │   CANCELLED     │
           │  (Selesai)      │    │  (Dibatalkan)   │
           └─────────────────┘    └────────┬────────┘
                                           │
                                           └──────────┘
```

---

## 11. Keyboard Shortcuts

| Shortcut | Aksi                          | Keterangan                    |
| -------- | ----------------------------- | ----------------------------- |
| `F1`     | Buka bantuan                  | Menampilkan daftar shortcut   |
| `F2`     | Fokus ke pencarian produk     | Cursor langsung ke search box |
| `F3`     | Pilih customer                | Buka modal customer           |
| `F4`     | Beri diskon                   | Buka modal diskon             |
| `F5`     | Tahan transaksi               | Hold current transaction      |
| `F6`     | Lanjutkan transaksi ditahan   | Resume held transaction       |
| `F7`     | Cetak struk terakhir          | Reprint last receipt          |
| `F8`     | Pembayaran tunai              | Quick cash payment            |
| `F9`     | Pembayaran QRIS               | Show QRIS QR code             |
| `F10`    | Proses pembayaran             | Open payment modal            |
| `F12`    | Batalkan transaksi            | Clear cart                    |
| `+`      | Tambah quantity               | Item yang dipilih             |
| `-`      | Kurang quantity               | Item yang dipilih             |
| `Del`    | Hapus item                    | Hapus dari keranjang          |
| `Esc`    | Tutup modal / clear selection | Context-sensitive             |

---

## 12. Wireframes Reference

> **Lihat:** [POS Wireframes](./wireframes/01-pos-wireframes.md)

| Wireframe                                                                                     | Deskripsi                 |
| --------------------------------------------------------------------------------------------- | ------------------------- |
| [POS Main Screen](./wireframes/01-pos-wireframes.md#1-pos-main-screen)                        | Tampilan utama POS        |
| [Payment Modal - Cash](./wireframes/01-pos-wireframes.md#2-payment-modal---cash)              | Modal pembayaran tunai    |
| [Payment Modal - QRIS](./wireframes/01-pos-wireframes.md#3-payment-modal---qris)              | Modal pembayaran QRIS     |
| [Payment Modal - Transfer](./wireframes/01-pos-wireframes.md#4-payment-modal---transfer)      | Modal pembayaran transfer |
| [Split Payment Modal](./wireframes/01-pos-wireframes.md#5-split-payment-modal)                | Modal split payment       |
| [Hold Transaction Modal](./wireframes/01-pos-wireframes.md#6-hold-transaction-modal)          | Modal tahan transaksi     |
| [Held Transactions List](./wireframes/01-pos-wireframes.md#7-held-transactions-list)          | Daftar transaksi ditahan  |
| [Discount Modal](./wireframes/01-pos-wireframes.md#8-discount-modal)                          | Modal input diskon        |
| [Customer Selection Modal](./wireframes/01-pos-wireframes.md#9-customer-selection-modal)      | Modal pilih customer      |
| [Return/Refund Screen](./wireframes/01-pos-wireframes.md#10-returnrefund-screen)              | Halaman retur barang      |
| [Transaction History Screen](./wireframes/01-pos-wireframes.md#11-transaction-history-screen) | Halaman riwayat transaksi |
| [Transaction Detail Modal](./wireframes/01-pos-wireframes.md#12-transaction-detail-modal)     | Modal detail transaksi    |
| [Receipt/Struk Preview](./wireframes/01-pos-wireframes.md#13-receiptstruk-preview)            | Preview struk pembayaran  |
