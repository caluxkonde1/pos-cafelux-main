# 🗄️ Setup Database untuk Navicat - Panduan Lengkap

## 📋 Pilihan Database untuk Navicat

### 🎯 **OPSI 1: Supabase (RECOMMENDED - Mudah & Gratis)**

#### ✅ Keuntungan Supabase:
- ✅ **Gratis** hingga 500MB storage
- ✅ **Tidak perlu install** software tambahan
- ✅ **Langsung bisa diakses** dengan Navicat
- ✅ **Cloud-based** - bisa diakses dari mana saja
- ✅ **Auto backup** dan high availability
- ✅ **Real-time** features built-in

#### 🚀 Langkah Setup Supabase:

1. **Buat Akun Supabase**
   - Kunjungi: https://supabase.com
   - Sign up dengan email/GitHub
   - Buat project baru

2. **Dapatkan Connection Details**
   ```
   Host: db.xxx.supabase.co
   Port: 5432
   Database: postgres
   Username: postgres
   Password: [password yang Anda set]
   ```

3. **Setup di Navicat**
   - Buka Navicat
   - New Connection → PostgreSQL
   - Masukkan detail connection di atas
   - Test Connection → Connect

4. **Update .env File**
   ```env
   DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
   USE_LOCAL_DB=true
   SKIP_DATABASE=false
   ```

---

### 🏠 **OPSI 2: PostgreSQL Lokal**

#### 📥 Install PostgreSQL di Windows:

1. **Download PostgreSQL**
   - Kunjungi: https://www.postgresql.org/download/windows/
   - Download installer terbaru
   - Jalankan installer

2. **Setup saat Install**
   ```
   Port: 5432 (default)
   Username: postgres
   Password: password123 (atau sesuai keinginan)
   ```

3. **Verifikasi Installation**
   ```cmd
   psql -U postgres -h localhost
   ```

4. **Jalankan Setup Script**
   ```cmd
   node setup-local-postgresql.cjs
   ```

5. **Connection Details untuk Navicat**
   ```
   Host: localhost
   Port: 5432
   Database: pos_cafelux
   Username: postgres
   Password: password123
   ```

---

### 🌐 **OPSI 3: Database Online Gratis**

#### A. **ElephantSQL (PostgreSQL Gratis)**
- Website: https://www.elephantsql.com/
- Plan gratis: 20MB storage
- Langsung dapat connection string

#### B. **Aiven (PostgreSQL Gratis)**
- Website: https://aiven.io/
- Plan gratis: 1 bulan trial
- Support multiple database types

#### C. **Railway (PostgreSQL Gratis)**
- Website: https://railway.app/
- Plan gratis dengan usage limits
- Easy deployment

---

## 🔧 **Setup Aplikasi untuk Database**

### 1. **Update Environment Variables**

Buat file `.env.local`:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
USE_LOCAL_DB=true
SKIP_DATABASE=false

# Server Configuration
PORT=5001
NODE_ENV=development
USE_MOCK_DATA=false
```

### 2. **Restart Aplikasi**
```cmd
npm run dev
```

### 3. **Verifikasi Connection**
- Cek terminal logs untuk "✅ PostgreSQL database connection initialized successfully"
- Aplikasi akan otomatis menggunakan DatabaseStorage

---

## 📊 **Setup Navicat Connection**

### 🔗 **Langkah-langkah:**

1. **Buka Navicat**
2. **New Connection** → **PostgreSQL**
3. **Masukkan Details:**
   ```
   Connection Name: POS CafeLux
   Host: [sesuai pilihan database]
   Port: 5432
   Initial Database: [nama database]
   User Name: [username]
   Password: [password]
   ```
4. **Test Connection**
5. **OK** untuk save
6. **Double-click** untuk connect

### 📋 **Tables yang Akan Tersedia:**
- `users` - Data pengguna dan admin
- `categories` - Kategori produk
- `products` - Data produk
- `transactions` - Transaksi penjualan
- `transaction_items` - Detail item transaksi
- `customers` - Data pelanggan
- `inventory` - Pergerakan stok
- `cash_flow` - Arus kas
- `tables` - Manajemen meja
- `reservations` - Reservasi meja
- `reminders` - Pengingat

---

## 🎯 **Rekomendasi Terbaik**

### 🥇 **Untuk Development:**
**Supabase** - Paling mudah dan tidak perlu setup kompleks

### 🥈 **Untuk Production:**
**PostgreSQL Lokal** - Full control dan performa optimal

### 🥉 **Untuk Testing:**
**ElephantSQL** - Gratis dan cepat setup

---

## 🔍 **Troubleshooting**

### ❌ **Connection Failed**
1. Cek firewall settings
2. Verifikasi username/password
3. Pastikan database service running
4. Test dengan psql command line

### ❌ **Tables Not Found**
1. Jalankan migration script
2. Cek database permissions
3. Verifikasi schema creation

### ❌ **Performance Issues**
1. Add database indexes
2. Optimize queries
3. Check connection pool settings

---

## 📞 **Support**

Jika mengalami masalah:
1. Cek logs di terminal aplikasi
2. Test connection dengan psql
3. Verifikasi environment variables
4. Restart aplikasi dan database service

---

**🎉 Setelah setup berhasil, Anda bisa:**
- ✅ Akses database dengan Navicat
- ✅ Lihat data real-time
- ✅ Edit data langsung dari Navicat
- ✅ Backup/restore database
- ✅ Monitor performa database
