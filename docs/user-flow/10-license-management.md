# License Management User Flow

Dokumentasi alur pengguna untuk manajemen lisensi BizFlow.

> **Catatan:** Sistem lisensi 100% offline - tidak butuh koneksi internet sama sekali.
> Aktivasi dilakukan manual via WhatsApp/Email.

---

## 1. Alur Aktivasi Lisensi (Offline)

```
┌─────────────────┐                              ┌─────────────────┐
│    Customer     │                              │  Anda (Seller)  │
│  (BizFlow App)  │                              │  (Manual)       │
└────────┬────────┘                              └────────┬────────┘
         │                                                │
         │ 1. Buka app → Lihat Machine ID                 │
         │    Machine ID: 7F3A-9B2C-4D1E                  │
         │                                                │
         │ 2. Kirim via WA/Email ─────────────────────▶   │
         │    "Saya beli BizFlow, Machine ID saya:        │
         │     7F3A-9B2C-4D1E"                            │
         │                                                │
         │                                       ┌────────┴────────┐
         │                                       │ Anda generate   │
         │                                       │ license key     │
         │                                       │ dengan tool     │
         │                                       └────────┬────────┘
         │                                                │
         │ 3. Terima License Key ◀─────────────────────── │
         │    "License Key Anda:                          │
         │     BZFL-7F3A-XXXX-XXXX-XXXX"                  │
         │                                                │
         │ 4. Input License Key di app                    │
         │    → Validasi offline (cryptographic)          │
         │    → Aktivasi berhasil! ✅                     │
         │                                                │
```

---

## 2. UI Aktivasi Lisensi

```
┌──────────────────────────────────────────────────────────────┐
│  🔑 Aktivasi Lisensi                            [─] [□] [×]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Machine ID Anda:                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  7F3A-9B2C-4D1E                          [ 📋 Copy ]   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Kirim Machine ID di atas ke penjual untuk mendapat         │
│  License Key via WhatsApp atau Email.                        │
│                                                              │
│  📞 WhatsApp: 0812-xxxx-xxxx                                 │
│  📧 Email: license@bizflow.id                                │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  Masukkan License Key yang Anda terima:                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  BZFL-                                                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                              [ 🔓 Aktivasi Lisensi ]         │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Belum punya lisensi? [ Beli Lisensi ] atau [ Coba Trial ]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Cara Validasi Offline (Cryptographic)

```
License Key Format: BZFL-[MACHINE_ID_HASH]-[SIGNATURE]

Contoh: BZFL-7F3A-A8K2-M4P9-W3X7

┌─────────────────────────────────────────────────────────────┐
│  Bagaimana validasi tanpa internet?                         │
│                                                             │
│  1. License key di-generate dengan PRIVATE KEY (Anda simpan)│
│  2. App BizFlow punya PUBLIC KEY (embedded di kode)         │
│  3. Saat aktivasi:                                          │
│     • App decode license key                                │
│     • Verify signature dengan public key                    │
│     • Cek machine ID cocok                                  │
│     • Jika valid → aktivasi berhasil                        │
│                                                             │
│  ✅ Tidak bisa dipalsukan tanpa private key Anda            │
│  ✅ Tidak butuh internet sama sekali                        │
│  ✅ License terikat ke machine ID                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Transfer Lisensi ke Device Lain

> Transfer lisensi dilakukan manual via WhatsApp/Email ke support.

```
┌──────────────────────────────────────────────────────────────┐
│  🔄 Transfer Lisensi                            [─] [□] [×]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Untuk memindahkan lisensi ke device lain:                   │
│                                                              │
│  1. Hubungi support via WhatsApp/Email                       │
│  2. Kirim informasi:                                         │
│     • License Key lama: BZFL-7F3A-XXXX-XXXX-XXXX             │
│     • Machine ID lama: 7F3A-9B2C-4D1E                        │
│     • Machine ID baru: [dari app di PC baru]                 │
│     • Alasan transfer: Ganti komputer                        │
│                                                              │
│  3. Anda akan menerima License Key baru untuk device baru    │
│                                                              │
│  📞 WhatsApp: 0812-xxxx-xxxx                                 │
│  📧 Email: license@bizflow.id                                │
│                                                              │
│  ⚠️ License Key lama akan otomatis tidak valid               │
│     karena terikat dengan Machine ID lama                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Tool Generate License Key (Seller)

```bash
# CLI tool untuk generate license key (Anda jalankan di PC Anda)
$ bizflow-license generate --machine-id 7F3A-9B2C-4D1E --package starter

Generated License Key:
BZFL-7F3A-A8K2-M4P9-W3X7

Valid for:
- Machine ID: 7F3A-9B2C-4D1E
- Package: Starter (3 users, 1 outlet)
- Features: pos, inventory, reports
```

---

## 6. Keuntungan Sistem Offline

| Aspek              | Keuntungan                              |
| ------------------ | --------------------------------------- |
| **Biaya**          | ❌ Tidak perlu VPS/cloud                |
| **Maintenance**    | ❌ Tidak perlu maintain server          |
| **Reliability**    | ✅ Tidak tergantung internet            |
| **Security**       | ✅ Cryptographic, tidak bisa dipalsukan |
| **Personal Touch** | ✅ Interaksi langsung dengan customer   |
