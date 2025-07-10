# 🚀 **QUICK START - SUPABASE LOCAL SETUP**

## 📋 **CARA CEPAT SETUP LOCAL ENVIRONMENT**

### **🎯 Option 1: Interactive Setup (Recommended)**
```bash
# Jalankan setup wizard interaktif
npm run setup:supabase
```

### **🎯 Option 2: Manual Setup**
```bash
# 1. Copy template environment
cp .env.local.example .env.local

# 2. Edit .env.local dengan kredensial Supabase Anda
# 3. Install dependencies
npm install

# 4. Test koneksi
npm run test:connection

# 5. Start development server
npm run dev
```

---

## 🔗 **KREDENSIAL SUPABASE YANG DIBUTUHKAN**

### **Dapatkan dari Supabase Dashboard:**
1. **Login**: https://supabase.com/dashboard
2. **Project Settings** > **Database**:
   - Connection String: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
3. **Project Settings** > **API**:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📊 **DATABASE SCHEMA SETUP**

### **SQL Script untuk Supabase:**
```sql
-- Copy & paste script ini di Supabase SQL Editor
-- (Script lengkap ada di SUPABASE_LOCAL_SETUP_GUIDE.md)

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO categories (name, description) VALUES
('Kopi', 'Berbagai jenis minuman kopi'),
('Makanan', 'Makanan ringan dan berat');

INSERT INTO products (code, name, price, stock, category_id) VALUES
('KOPI001', 'Americano', 15000, 100, (SELECT id FROM categories WHERE name = 'Kopi' LIMIT 1)),
('KOPI002', 'Cappuccino', 20000, 100, (SELECT id FROM categories WHERE name = 'Kopi' LIMIT 1));
```

---

## ✅ **VERIFICATION CHECKLIST**

### **Setelah Setup:**
- [ ] File `.env.local` sudah dibuat dengan kredensial benar
- [ ] `npm install` berhasil
- [ ] `npm run test:connection` menunjukkan ✅ success
- [ ] `npm run dev` berjalan tanpa error
- [ ] http://localhost:3000 menampilkan dashboard
- [ ] Bisa tambah produk baru dan data tersimpan

---

## 🛠 **TROUBLESHOOTING**

### **Connection Error:**
```bash
Error: getaddrinfo ENOTFOUND
```
**Fix**: Cek DATABASE_URL di .env.local, pastikan password dan project ref benar

### **Permission Error:**
```bash
Error: permission denied
```
**Fix**: Enable RLS policies di Supabase atau gunakan service role key

### **Module Error:**
```bash
Error: Cannot find module '@supabase/supabase-js'
```
**Fix**: `npm install @supabase/supabase-js`

---

## 📚 **DOKUMENTASI LENGKAP**

- **Setup Guide**: `SUPABASE_LOCAL_SETUP_GUIDE.md`
- **Environment Template**: `.env.local.example`
- **Interactive Setup**: `setup-supabase-local.js`

---

## 🎉 **READY TO GO!**

Setelah setup selesai, aplikasi POS CafeLux siap untuk development dengan:
- ✅ **Database**: Supabase PostgreSQL (production-ready)
- ✅ **Real-time**: Live data synchronization
- ✅ **Scalable**: Cloud-native architecture
- ✅ **Secure**: Row Level Security enabled

**Happy coding! 🚀**
