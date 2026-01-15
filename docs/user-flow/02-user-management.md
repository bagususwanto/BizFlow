# User & Access Management User Flow

Dokumentasi alur pengguna untuk modul Manajemen User & Akses BizFlow.

> 📌 **Wireframes:** Lihat [User Management Wireframes](wireframes/02-user-management-wireframes.md) untuk semua tampilan UI.

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     USER & ACCESS MANAGEMENT OVERVIEW                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Login/    │  │   User      │  │   Role &    │  │   Audit     │        │
│  │   Logout    │  │   CRUD      │  │  Permission │  │    Log      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Fitur Utama:                                                               │
│  • Login dengan username/email + password                                   │
│  • Manajemen user (tambah, edit, nonaktifkan)                               │
│  • Role-based access control (RBAC)                                         │
│  • Permission granular per fitur/modul                                      │
│  • Audit log semua aktivitas user                                           │
│  • Session management & auto-logout                                         │
│  • Password policy & reset                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Login Flow

### 2.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Buka aplikasi BizFlow
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan halaman    │
  │  Login                │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Input username/email │
  │  + password           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Login    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Tidak Valid
  │  Validasi kredensial  │─────────────────────┐
  └───────────┬───────────┘                     │
              │ Valid                           ▼
              │                    ┌───────────────────────┐
              │                    │  Tampilkan error:     │
              │                    │  "Username/password   │
              │                    │   tidak valid"        │
              │                    └───────────┬───────────┘
              │                                │
              │                                ▼
              │                    ┌───────────────────────┐
              │                    │  Cek jumlah percobaan │
              │                    │  gagal login          │
              │                    └───────────┬───────────┘
              │                                │
              │           < 5 kali ┌───────────┴───────────┐ >= 5 kali
              │                    │                       │
              │                    ▼                       ▼
              │         [Kembali ke input]    ┌───────────────────────┐
              │                               │  Account locked      │
              │                               │  (30 menit)          │
              │                               └───────────────────────┘
              ▼
  ┌───────────────────────┐
  │  Cek status user      │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Aktif             ▼ Nonaktif
  ┌─────────┐     ┌───────────────────────┐
  │         │     │  Tampilkan error:     │
  │         │     │  "Akun dinonaktifkan" │
  │         │     └───────────────────────┘
  │         │
  ▼         │
  ┌───────────────────────┐
  │  Generate session     │
  │  token                │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Load user permission │
  │  & role               │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "User Login"         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Redirect ke          │
  │  Dashboard            │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 2.2 Login Error Handling

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOGIN ERROR HANDLING                                │
└─────────────────────────────────────────────────────────────────────────────┘

   Error Type                    Message                        Action
   ─────────────────────────────────────────────────────────────────────────
   Invalid credentials    →    "Username atau password          Clear password
                                tidak valid"                     field

   Account locked         →    "Akun terkunci. Coba lagi        Show countdown
                                dalam XX menit"                  timer

   Account disabled       →    "Akun Anda dinonaktifkan.        Contact admin
                                Hubungi administrator"           link

   Session expired        →    "Sesi Anda telah berakhir.       Auto redirect
                                Silakan login kembali"           to login

   Network error          →    "Tidak dapat terhubung ke        Retry button
                                server. Periksa koneksi"
```

---

## 3. Logout Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGOUT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik menu Logout
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  konfirmasi logout    │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Ya                ▼ Tidak
  ┌─────────┐     ┌───────────────────────┐
  │         │     │  Tutup dialog,        │
  │         │     │  kembali ke app       │
  │         │     └───────────────────────┘
  │         │
  ▼
  ┌───────────────────────┐
  │  Invalidate session   │
  │  token                │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Clear local storage  │
  │  / session data       │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "User Logout"        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Redirect ke          │
  │  halaman Login        │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 4. User CRUD Flow

### 4.1 Create User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CREATE USER FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin klik "Tambah User"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Tambah User          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Input data user:                                                     │
  │                                                                       │
  │  • Username *         (unique, min 4 char)                            │
  │  • Email *            (unique, valid format)                          │
  │  • Nama Lengkap *                                                     │
  │  • No. Telepon                                                        │
  │  • Password *         (min 8 char, 1 huruf besar, 1 angka)            │
  │  • Konfirmasi Password *                                              │
  │  • Pilih Role *       (dropdown: Admin, Kasir, Supervisor, Staff)     │
  │  • Outlet/Cabang      (multi-select)                                  │
  │  • Status             (Aktif/Nonaktif)                                │
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
  │  (client-side)        │                     │
  └───────────┬───────────┘                     ▼
              │ Valid              ┌───────────────────────┐
              │                    │  Tampilkan error      │
              │                    │  validasi             │
              │                    └───────────┬───────────┘
              │                                │
              │                    [Kembali ke form]
              ▼
  ┌───────────────────────┐     Duplicate
  │  Cek duplicate        │─────────────────────┐
  │  username/email       │                     │
  └───────────┬───────────┘                     ▼
              │ Unique             ┌───────────────────────┐
              │                    │  "Username/email      │
              │                    │   sudah digunakan"    │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐
  │  Simpan user ke       │
  │  database             │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Kirim email          │
  │  aktivasi (optional)  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "Create User: xxx"   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "User berhasil       │
  │   ditambahkan"        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Redirect ke          │
  │  User List            │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 4.2 Edit User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EDIT USER FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin klik "Edit" pada user
              │
              ▼
  ┌───────────────────────┐
  │  Load data user       │
  │  dari database        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Edit User (prefilled)│
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Field yang dapat diedit:                                             │
  │                                                                       │
  │  • Username           (readonly jika sudah digunakan)                 │
  │  • Email                                                              │
  │  • Nama Lengkap                                                       │
  │  • No. Telepon                                                        │
  │  • Role               (dropdown)                                      │
  │  • Outlet/Cabang      (multi-select)                                  │
  │  • Status             (Aktif/Nonaktif)                                │
  │  • [ ] Reset Password (checkbox - generate password baru)             │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Update   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Validasi perubahan   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update database      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "Update User: xxx"   │
  │  + detail perubahan   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "User berhasil       │
  │   diupdate"           │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 4.3 Deactivate User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEACTIVATE USER FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin klik "Nonaktifkan" pada user
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  konfirmasi           │
  │                       │
  │  "Apakah Anda yakin   │
  │   ingin menonaktifkan │
  │   user [USERNAME]?"   │
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
  │  Cek apakah user      │
  │  sedang aktif/login   │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Tidak login       ▼ Sedang login
  ┌─────────┐     ┌───────────────────────┐
  │         │     │  Force logout user    │
  │         │     │  dari semua session   │
  │         │     └───────────┬───────────┘
  │         │                 │
  │◀────────┴─────────────────┘
  │
  ▼
  ┌───────────────────────┐
  │  Update status user   │
  │  menjadi "Nonaktif"   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "Deactivate User:    │
  │   xxx"                │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "User berhasil       │
  │   dinonaktifkan"      │
  └───────────────────────┘
              │
              ▼
           [END]

  ⚠️ Note: User yang dinonaktifkan tidak dihapus dari database,
           hanya tidak bisa login. Data transaksi tetap tersimpan.
```

---

## 5. Role & Permission Management

### 5.1 Role Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROLE MANAGEMENT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin akses menu "Pengaturan > Role & Permission"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan daftar     │
  │  Role yang tersedia   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Default Roles:                                                       │
  │                                                                       │
  │  ┌──────────────┬──────────────────────────────────────────────────┐  │
  │  │ Role         │ Deskripsi                                        │  │
  │  ├──────────────┼──────────────────────────────────────────────────┤  │
  │  │ Super Admin  │ Akses penuh ke semua fitur (tidak bisa diedit)   │  │
  │  │ Admin        │ Manajemen user, laporan, pengaturan              │  │
  │  │ Supervisor   │ Monitoring transaksi, approval, laporan          │  │
  │  │ Kasir        │ Akses POS, transaksi                             │  │
  │  │ Staff        │ Input data, view only                            │  │
  │  └──────────────┴──────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Pilih aksi:          │
  │  • Tambah Role        │
  │  • Edit Permission    │
  │  • Duplikat Role      │
  │  • Hapus Role         │
  └───────────────────────┘
```

### 5.2 Permission Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PERMISSION MATRIX                                  │
└─────────────────────────────────────────────────────────────────────────────┘

   Module              │ Super Admin │ Admin │ Supervisor │ Kasir │ Staff
   ─────────────────────────────────────────────────────────────────────────
   POS                 │
     - Transaksi       │     ✓       │   ✓   │     ✓      │   ✓   │   -
     - Void            │     ✓       │   ✓   │     ✓      │   -   │   -
     - Diskon          │     ✓       │   ✓   │     ✓      │   *   │   -
     - Return          │     ✓       │   ✓   │     ✓      │   -   │   -
   ─────────────────────────────────────────────────────────────────────────
   User Management     │
     - View            │     ✓       │   ✓   │     -      │   -   │   -
     - Create          │     ✓       │   ✓   │     -      │   -   │   -
     - Edit            │     ✓       │   ✓   │     -      │   -   │   -
     - Delete          │     ✓       │   -   │     -      │   -   │   -
   ─────────────────────────────────────────────────────────────────────────
   Product Management  │
     - View            │     ✓       │   ✓   │     ✓      │   ✓   │   ✓
     - Create          │     ✓       │   ✓   │     -      │   -   │   -
     - Edit            │     ✓       │   ✓   │     -      │   -   │   -
     - Delete          │     ✓       │   ✓   │     -      │   -   │   -
   ─────────────────────────────────────────────────────────────────────────
   Reports             │
     - Sales Report    │     ✓       │   ✓   │     ✓      │   -   │   -
     - Finance Report  │     ✓       │   ✓   │     -      │   -   │   -
     - Export          │     ✓       │   ✓   │     *      │   -   │   -
   ─────────────────────────────────────────────────────────────────────────
   Settings            │
     - System          │     ✓       │   -   │     -      │   -   │   -
     - Outlet          │     ✓       │   ✓   │     -      │   -   │   -
     - Printer         │     ✓       │   ✓   │     ✓      │   -   │   -
   ─────────────────────────────────────────────────────────────────────────

   Legend:
   ✓ = Full access
   * = Limited access (with approval / max limit)
   - = No access
```

### 5.3 Edit Permission Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EDIT PERMISSION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin klik "Edit Permission" pada role
              │
              ▼
  ┌───────────────────────┐
  │  Load permission      │
  │  matrix untuk role    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Permission Matrix    │
  │  (checklist per modul)│
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Untuk setiap modul, pilih aksi yang diizinkan:                       │
  │                                                                       │
  │  □ View    - Melihat data                                             │
  │  □ Create  - Membuat data baru                                        │
  │  □ Edit    - Mengubah data                                            │
  │  □ Delete  - Menghapus data                                           │
  │  □ Export  - Export data (PDF/Excel)                                  │
  │  □ Approve - Menyetujui (jika ada workflow approval)                  │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Simpan   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update permission    │
  │  di database          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "Update Permission:  │
  │   [Role] + changes"   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Refresh permission   │
  │  untuk user aktif     │
  │  dengan role tersebut │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "Permission berhasil │
  │   diupdate"           │
  └───────────────────────┘
              │
              ▼
           [END]
```

---

## 6. Audit Log Flow

### 6.1 Audit Log Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUDIT LOG STRUCTURE                                │
└─────────────────────────────────────────────────────────────────────────────┘

  Setiap aktivitas dicatat dengan informasi:

  ┌───────────────────────────────────────────────────────────────────────┐
  │  Field              │ Deskripsi                                       │
  ├─────────────────────┼─────────────────────────────────────────────────┤
  │  Timestamp          │ Waktu kejadian (dengan timezone)                │
  │  User ID            │ ID user yang melakukan aksi                     │
  │  User Name          │ Nama user                                       │
  │  IP Address         │ IP address user                                 │
  │  Device Info        │ Browser/app yang digunakan                      │
  │  Action Type        │ LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW     │
  │  Module             │ Modul yang diakses                              │
  │  Entity ID          │ ID data yang diakses/diubah                     │
  │  Old Value          │ Nilai sebelum perubahan (untuk UPDATE)          │
  │  New Value          │ Nilai setelah perubahan (untuk UPDATE)          │
  │  Status             │ SUCCESS atau FAILED                             │
  │  Error Message      │ Pesan error jika gagal                          │
  └─────────────────────┴─────────────────────────────────────────────────┘
```

### 6.2 View Audit Log Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VIEW AUDIT LOG FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin akses menu "Audit Log"
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan halaman    │
  │  Audit Log dengan     │
  │  filter default       │
  │  (Hari ini)           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Filter yang tersedia:                                                │
  │                                                                       │
  │  • Tanggal        : [Start Date] - [End Date]                         │
  │  • User           : [Dropdown - semua user]                           │
  │  • Action Type    : [Checkbox - LOGIN, LOGOUT, CREATE, dll]           │
  │  • Module         : [Dropdown - semua modul]                          │
  │  • Status         : [All / Success / Failed]                          │
  │  • Keyword        : [Search text]                                     │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan daftar     │
  │  audit log            │
  │  (paginated)          │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik item untuk      │
  │  melihat detail?      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan modal      │
  │  detail audit log:    │
  │  - Old vs New value   │
  │  - Device info        │
  │  - Full JSON data     │
  └───────────────────────┘
              │
              ▼
  ┌───────────────────────┐        ┌───────────────────────┐
  │  Export?              │───Yes──│  Generate CSV/Excel   │
  └───────────────────────┘        │  dengan filter aktif  │
              │                    └───────────────────────┘
              ▼ No
           [END]
```

---

## 7. Password Management Flow

### 7.1 Reset Password (by Admin)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RESET PASSWORD FLOW (Admin)                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] Admin klik "Reset Password" pada user
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan dialog     │
  │  konfirmasi           │
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
  │  Generate password    │
  │  random (12 char)     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Update password di   │
  │  database             │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Set flag "Must       │
  │  Change Password"     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Kirim email dengan   │
  │  password baru        │
  │  (optional)           │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan password   │
  │  baru di modal        │
  │  (copy to clipboard)  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "Reset Password:     │
  │   [username]"         │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 7.2 Change Password (by User)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CHANGE PASSWORD FLOW (User)                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User akses menu "Ubah Password" / Forced change
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan form       │
  │  Ubah Password        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────────────────────────────────────────────────────┐
  │  Input:                                                               │
  │                                                                       │
  │  • Password Lama *                                                    │
  │  • Password Baru *     (min 8 char, 1 huruf besar, 1 angka)           │
  │  • Konfirmasi Password Baru *                                         │
  │                                                                       │
  │  Password Policy:                                                     │
  │  ✓ Minimal 8 karakter                                                 │
  │  ✓ Minimal 1 huruf besar                                              │
  │  ✓ Minimal 1 angka                                                    │
  │  ✓ Tidak boleh sama dengan 3 password terakhir                        │
  └───────────────────────────────────────────────────────────────────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Simpan   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Gagal
  │  Validasi password    │─────────────────────┐
  │  lama                 │                     │
  └───────────┬───────────┘                     ▼
              │ Valid              ┌───────────────────────┐
              │                    │  "Password lama       │
              │                    │   tidak sesuai"       │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐     Gagal
  │  Validasi password    │─────────────────────┐
  │  baru (policy)        │                     │
  └───────────┬───────────┘                     ▼
              │ Valid              ┌───────────────────────┐
              │                    │  Tampilkan error      │
              │                    │  validasi policy      │
              │                    └───────────────────────┘
              ▼
  ┌───────────────────────┐
  │  Update password      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Clear flag "Must     │
  │  Change Password"     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Catat audit log      │
  │  "Change Password"    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan notifikasi │
  │  "Password berhasil   │
  │   diubah"             │
  └───────────────────────┘
              │
              ▼
           [END]
```

### 7.3 Forgot Password (by User)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FORGOT PASSWORD FLOW (User)                            │
└─────────────────────────────────────────────────────────────────────────────┘

  [START] User klik link "Lupa Password?" di halaman Login
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan halaman    │
  │  Forgot Password      │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Input alamat Email   │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik tombol Kirim    │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Tampilkan pesan      │
  │  sukses (generic)     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Tidak
  │  Apakah Email valid?  │─────────────────────┐
  └───────────┬───────────┘                     │
              │ Ya                              │
              ▼                                 │
  ┌───────────────────────┐                     │
  │  Generate Secure      │                     │
  │  Reset Token          │                     │
  └───────────┬───────────┘                     │
              │                                 │
              ▼                                 │
  ┌───────────────────────┐                     │
  │  Kirim email dengan   │                     │
  │  link reset password  │                     │
  └───────────┬───────────┘                     │
              │                                 │
              ▼                                 │
  ┌───────────────────────┐                     │
  │  User klik link di    │                     ▼
  │  email (dengan token) │                  [END]
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐     Tidak Valid
  │  Validasi Token       │─────────────────────┐
  └───────────┬───────────┘                     │
              │ Valid                           ▼
              ▼                       ┌───────────────────────┐
  ┌───────────────────────┐           │  Tampilkan error:     │
  │  Tampilkan form       │           │  "Token tidak valid"  │
  │  Reset Password       │           └───────────────────────┘
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Input Password Baru  │
  │  + Konfirmasi         │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Klik Reset Password  │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Hash & Update        │
  │  Password Baru        │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Invalidasi Token     │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │  Redirect ke Login    │
  │  + Pesan Sukses       │
  └───────────────────────┘
              │
              ▼
            [END]
```

---

## 8. Session Management

### 8.1 Session Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SESSION CONFIGURATION                                │
└─────────────────────────────────────────────────────────────────────────────┘

   Parameter                    │ Default Value    │ Deskripsi
   ─────────────────────────────────────────────────────────────────────────
   Session Timeout              │ 30 menit         │ Auto-logout jika idle
   Remember Me Duration         │ 7 hari           │ Durasi session jika
                                │                  │ "Remember Me" dicentang
   Max Concurrent Sessions      │ 1                │ Jumlah login bersamaan
                                │                  │ per user
   Failed Login Attempts        │ 5                │ Percobaan gagal sebelum
                                │                  │ lock
   Account Lock Duration        │ 30 menit         │ Durasi lock setelah
                                │                  │ failed attempts
   Password Expiry              │ 90 hari          │ Masa berlaku password
   ─────────────────────────────────────────────────────────────────────────

   ⚠️ Konfigurasi dapat diubah oleh Super Admin di menu Settings
```

### 8.2 Auto-Logout Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTO-LOGOUT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [RUNNING] User aktif menggunakan aplikasi
              │
              ▼
  ┌───────────────────────┐
  │  Timer idle dimulai   │
  │  (30 menit default)   │
  └───────────┬───────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼ Ada aktivitas     ▼ Tidak ada aktivitas
  ┌─────────┐         ┌───────────────────────┐
  │  Reset  │         │  Sisa 5 menit         │
  │  timer  │         │  Tampilkan warning    │
  └─────────┘         └───────────┬───────────┘
        ▲                         │
        │              ┌──────────┴──────────┐
        │              │                     │
        │              ▼ Ada aktivitas       ▼ Timeout
        │        ┌─────────┐     ┌───────────────────────┐
        └────────┤  Reset  │     │  Auto-logout          │
                 └─────────┘     │  Redirect ke Login    │
                                 └───────────────────────┘
```

---

## 9. State Diagram - User Status

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STATE DIAGRAM - USER STATUS                            │
└─────────────────────────────────────────────────────────────────────────────┘

                           Create User
                                │
                                ▼
                        ┌───────────────┐
                        │   PENDING     │
                        │  (Menunggu    │
                        │   Aktivasi)   │
                        └───────┬───────┘
                                │
                   Aktivasi ────┤───── Expire (7 hari)
                      │         │              │
                      ▼         │              ▼
              ┌───────────────┐ │      ┌───────────────┐
              │    ACTIVE     │◄┘      │   EXPIRED     │
              │   (Aktif)     │        │  (Kadaluarsa) │
              └───────┬───────┘        └───────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌─────────┐   ┌───────────────┐   ┌───────────────┐
│ LOCKED  │   │  SUSPENDED    │   │  INACTIVE     │
│(Terkunci│   │ (Ditangguhkan │   │ (Dinonaktif-  │
│ karena  │   │  oleh Admin)  │   │  kan)         │
│ login)  │   └───────┬───────┘   └───────┬───────┘
└────┬────┘           │                   │
     │                │                   │
     │    Reaktivasi ─┴───────────────────┘
     │                        │
     │ Timeout (30 min)       │
     │                        ▼
     └──────────────►┌───────────────┐
                     │    ACTIVE     │
                     │   (Aktif)     │
                     └───────────────┘
```

---

## 10. Keyboard Shortcuts

| Shortcut | Aksi               | Keterangan           |
| -------- | ------------------ | -------------------- |
| `Ctrl+N` | Tambah user baru   | Di halaman User List |
| `Ctrl+S` | Simpan form        | Di form Create/Edit  |
| `Ctrl+F` | Fokus ke pencarian | Di halaman User List |
| `Esc`    | Tutup modal/dialog | Context-sensitive    |
| `Enter`  | Submit form        | Di form aktif        |
| `Ctrl+E` | Edit user terpilih | Di halaman User List |

---

## 11. Wireframes Reference

> **Lihat:** [User Management Wireframes](./wireframes/02-user-management-wireframes.md)

| Wireframe                                                                                           | Deskripsi                |
| --------------------------------------------------------------------------------------------------- | ------------------------ |
| [Login Screen](./wireframes/02-user-management-wireframes.md#1-login-screen)                        | Halaman login            |
| [User List Screen](./wireframes/02-user-management-wireframes.md#2-user-list-screen)                | Daftar user              |
| [User Form Modal](./wireframes/02-user-management-wireframes.md#3-user-form-modal)                  | Form tambah/edit user    |
| [Role & Permission Screen](./wireframes/02-user-management-wireframes.md#4-role--permission-screen) | Permission matrix        |
| [Audit Log Screen](./wireframes/02-user-management-wireframes.md#5-audit-log-screen)                | Halaman audit log        |
| [Change Password Modal](./wireframes/02-user-management-wireframes.md#6-change-password-modal)      | Form ubah password       |
| [Logout Confirmation](./wireframes/02-user-management-wireframes.md#7-logout-confirmation-dialog)   | Dialog konfirmasi logout |
| [Session Management](./wireframes/02-user-management-wireframes.md#8-session-management-screen)     | Kelola session aktif     |
| [Role Form Modal](./wireframes/02-user-management-wireframes.md#9-role-form-modal)                  | Form tambah/edit role    |
