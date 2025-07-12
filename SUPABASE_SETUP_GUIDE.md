# 🏪 POS CafeLux - Panduan Setup Supabase

## 📋 Ringkasan Perbaikan

Aplikasi POS CafeLux telah diperbaiki untuk menggunakan Supabase sebagai database utama. Berikut adalah perbaikan yang telah dilakukan:

### ✅ Perbaikan Database & Backend
1. **Koneksi Supabase**: Database connection diperbaiki untuk menggunakan PostgreSQL Supabase
2. **Storage Layer**: DatabaseStorage diimplementasi lengkap menggantikan MemStorage
3. **API Routes**: Ditambahkan endpoint untuk export dan print transaksi
4. **Database Functions**: Fungsi-fungsi database PostgreSQL untuk operasi kompleks

### ✅ Perbaikan Frontend
1. **Supabase Client**: Konfigurasi client Supabase untuk frontend
2. **Halaman Kategori**: Tombol simpan kategori sekarang berfungsi
3. **Halaman Penjualan**: 
   - ✅ Filter transaksi berfungsi
   - ✅ Detail transaksi dengan modal lengkap
   - ✅ Export transaksi ke CSV
   - ✅ Print invoice
   - ✅ Tombol edit untuk admin

### ✅ Fitur Baru
1. **Transaction Detail Modal**: Modal detail lengkap dengan informasi transaksi
2. **Export Functionality**: Export data transaksi ke format CSV
3. **Print System**: Sistem cetak invoice sederhana
4. **Role-based Actions**: Tombol edit khusus untuk role admin

## 🚀 Cara Setup

### 1. Environment Variables
Buat file `.env` dari template:
```bash
cp .env.example .env
```

Isi dengan kredensial Supabase Anda:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]?sslmode=require

# Supabase Configuration
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Development Settings
NODE_ENV=development
PORT=5000
SKIP_DATABASE=false
USE_MOCK_DATA=false
```

### 2. Database Migration
Jalankan migrasi database ke Supabase:
```bash
# Menggunakan Supabase CLI
npm run migrate:supabase

# Atau manual melalui Supabase Dashboard
# Copy isi file supabase/migrations/*.sql ke SQL Editor
```

### 3. Test Koneksi
Test koneksi ke Supabase:
```bash
npm run test:supabase
```

### 4. Jalankan Aplikasi
```bash
# Dengan Supabase
npm run dev:supabase

# Atau normal
npm run dev
```

## 📁 Struktur Database

### Tables yang Diperlukan:
- `users` - Data pengguna/pegawai
- `categories` - Kategori produk
- `products` - Data produk
- `customers` - Data pelanggan
- `transactions` - Transaksi penjualan
- `transaction_items` - Item dalam transaksi
- `dashboard_stats` - Statistik dashboard
- `subscription_plans` - Paket berlangganan
- `features` - Fitur aplikasi

### Database Functions:
- `update_product_stock()` - Update stok produk
- `calculate_daily_sales()` - Hitung penjualan harian
- `get_top_products()` - Produk terlaris
- `update_customer_stats()` - Update statistik pelanggan

## 🔧 Fitur yang Sudah Diperbaiki

### ✅ Halaman Kategori
- Tombol "Simpan Kategori" sekarang menyimpan ke Supabase
- Validasi form dan error handling
- Refresh data setelah berhasil menambah kategori

### ✅ Halaman Penjualan
- **Filter Transaksi**: Filter berdasarkan tanggal dan status
- **Detail Transaksi**: Modal detail lengkap dengan informasi transaksi dan items
- **Export Data**: Export transaksi ke format CSV
- **Print Invoice**: Cetak invoice transaksi
- **Edit Transaksi**: Tombol edit khusus untuk role admin

### ✅ Halaman Riwayat Transaksi
- **Filter Transaksi**: Filter berdasarkan status dan pencarian
- **Detail Transaksi**: Modal detail lengkap dengan informasi transaksi
- **Export Data**: Export riwayat transaksi ke format CSV
- **Print Invoice**: Cetak invoice dari riwayat
- **Edit Transaksi**: Tombol edit khusus untuk role admin

### ✅ Halaman Rekap Kas
- **Tambah Transaksi Kas**: Modal untuk menambah kas masuk/keluar
- **Export Data**: Export rekap kas ke format CSV
- **Filter Jenis**: Filter berdasarkan jenis kas (masuk/keluar)
- **Quick Actions**: Tombol cepat untuk kas masuk, keluar, dan laporan

### ✅ Halaman Pengingat
- **Tambah Pengingat**: Modal untuk menambah pengingat baru
- **Edit Pengingat**: Edit pengingat yang sudah ada
- **Tombol Selesai**: Mark pengingat sebagai selesai
- **Notifikasi Stok Rendah**: Alert otomatis untuk produk stok rendah
- **Kelola Stok**: Modal untuk update stok produk langsung

### ✅ API Endpoints Baru
- `GET /api/transactions/export` - Export transaksi ke CSV
- `POST /api/transactions/:id/print` - Mark transaksi sebagai tercetak
- `POST /api/categories` - Buat kategori baru (sudah diperbaiki)
- `GET /api/cash-entries` - Ambil data kas entries
- `POST /api/cash-entries` - Tambah transaksi kas baru
- `GET /api/cash-entries/export` - Export kas entries ke CSV
- `GET /api/reminders` - Ambil data pengingat
- `POST /api/reminders` - Tambah pengingat baru
- `PUT /api/reminders/:id` - Update pengingat
- `POST /api/reminders/:id/complete` - Mark pengingat selesai
- `GET /api/products/low-stock` - Ambil produk dengan stok rendah
- `PUT /api/products/:id/stock` - Update stok produk

## 🚀 Deployment ke Vercel

### 1. Environment Variables di Vercel
Set environment variables di Vercel Dashboard:
```
DATABASE_URL=postgresql://...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2. Build & Deploy
```bash
npm run build
```

Atau push ke GitHub dan Vercel akan auto-deploy.

## 🔄 Fitur yang Masih Perlu Diperbaiki

### 🔲 Halaman Pelanggan
- Edit pelanggan
- Export data pelanggan
- Filter pelanggan

### 🔲 Halaman Laporan
- Grafik laporan
- Sinkronisasi outlet
- Filter outlet

### 🔲 Halaman Pegawai
- CRUD pegawai
- Edit status role-based

### 🔲 Halaman Inventaris
- CRUD item inventaris
- Detail item

### 🔲 Halaman Pengaturan Meja
- CRUD meja
- Layout meja
- Kelola reservasi

### 🔲 Sistem Autentikasi
- Login email
- Login Google
- Login No HP
- Halaman profil user

### 🔲 Halaman Beranda/Dashboard
- Desain halaman depan sesuai referensi gambar
- Grafik dan statistik real-time

## 📞 Support

Jika ada masalah:
1. Cek koneksi Supabase dengan `npm run test:supabase`
2. Pastikan environment variables sudah benar
3. Cek console browser untuk error JavaScript
4. Cek server logs untuk error backend

## 🎯 Next Steps

1. **Prioritas Tinggi**: Perbaiki halaman riwayat transaksi dan rekap kas
2. **Prioritas Sedang**: Implementasi sistem autentikasi
3. **Prioritas Rendah**: Fitur advanced seperti multi-outlet dan reservasi meja

---

**Status**: ✅ Database connection fixed, ✅ Categories working, ✅ Sales page enhanced
**Next**: Fix remaining pages and implement authentication system
