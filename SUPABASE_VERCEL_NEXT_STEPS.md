# 🚀 SUPABASE + VERCEL NEXT STEPS GUIDE

## ✅ Status: Supabase sudah terkoneksi dengan Vercel

Karena Anda sudah memiliki ANON_KEY dan SERVICE_ROLE_KEY, berikut adalah langkah selanjutnya:

## 📋 STEP 1: Setup Database Schema di Supabase

### 1.1 Buka Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Pilih project: `wbseybltsgfstwqqnzxg`
- Klik **SQL Editor**

### 1.2 Run Migration Scripts (Urutan Penting!)

**Migration 1: Initial Schema**
```sql
-- Copy dan paste seluruh isi dari file:
-- supabase/migrations/20250110000000_initial_pos_cafelux_schema.sql
-- Klik "Run" untuk execute
```

**Migration 2: Database Functions**
```sql
-- Copy dan paste seluruh isi dari file:
-- supabase/migrations/20250110000001_database_functions.sql
-- Klik "Run" untuk execute
```

**Migration 3: Enhanced Features**
```sql
-- Copy dan paste seluruh isi dari file:
-- supabase/migrations/20250115000000_enhanced_product_management.sql
-- Klik "Run" untuk execute
```

### 1.3 Verify Tables Created
Setelah run semua migrations, cek di **Table Editor**:
- ✅ users
- ✅ products  
- ✅ categories
- ✅ customers
- ✅ transactions
- ✅ transaction_items
- ✅ subscription_plans
- ✅ features
- ✅ product_options
- ✅ raw_materials
- ✅ production_logs

## 📋 STEP 2: Test Koneksi Database

### 2.1 Test dari Localhost
```bash
# Di terminal, jalankan:
node test-supabase-connection.js
```

### 2.2 Expected Output:
```
🔍 ===== SUPABASE CONNECTION TEST =====

1️⃣ Checking environment variables...
   ✅ DATABASE_URL: postgresql://postgres:...
   ✅ NEXT_PUBLIC_SUPABASE_URL: https://wbseybltsgfstwqqnzxg.supabase.co...
   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIs...

2️⃣ Testing PostgreSQL connection...
   ✅ PostgreSQL connection successful!

3️⃣ Testing Supabase API...
   ✅ Supabase API connection successful!

4️⃣ Checking database tables...
   ✅ Database tables found:
      - categories
      - products
      - transactions
      - users
```

## 📋 STEP 3: Test Aplikasi Localhost

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test Login
- Buka: http://localhost:5004
- Login dengan: `admin` / `admin123`
- Verify dashboard loads

### 3.3 Test Core Features
- ✅ Product management (add/edit/delete)
- ✅ Category management
- ✅ Search dan filter
- ✅ Mobile responsive

## 📋 STEP 4: Vercel Environment Variables

Pastikan di Vercel Dashboard > Settings > Environment Variables sudah ada:

```bash
DATABASE_URL=postgresql://postgres:Caluxkonde87253186@db.wbseybltsgfstwqqnzxg.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://wbseybltsgfstwqqnzxg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dari .env.supabase]
SUPABASE_SERVICE_ROLE_KEY=[dari .env.supabase]
NODE_ENV=production
SESSION_SECRET=pos_cafelux_2024_secure_session_key_12345
JWT_SECRET=pos_cafelux_2024_jwt_secret_key_67890
NEXT_PUBLIC_APP_URL=https://pos-cafelux-main.vercel.app
```

## 📋 STEP 5: Deploy dan Test Production

### 5.1 Trigger Deployment
- Push code ke GitHub (sudah done)
- Vercel akan auto-deploy
- Check deployment logs

### 5.2 Test Production App
- Buka: https://pos-cafelux-main.vercel.app
- Test login: `admin` / `admin123`
- Test semua fitur core

## 🔧 TROUBLESHOOTING

### Jika Database Connection Error:
1. Check environment variables di Vercel
2. Verify Supabase project status
3. Check RLS policies di Supabase

### Jika Migration Error:
1. Drop existing tables di Supabase
2. Re-run migrations dalam urutan
3. Check for syntax errors

### Jika Login Error:
1. Check users table ada data admin
2. Verify password hash
3. Check session configuration

## 📞 QUICK COMMANDS

```bash
# Test database connection
node test-supabase-connection.js

# Start local development
npm run dev

# Check build
npm run build

# Test production build
npm run start
```

## 🎯 SUCCESS INDICATORS

✅ **Database Setup Complete:**
- All tables created in Supabase
- Sample data inserted
- Admin user exists

✅ **Local Testing Complete:**
- App runs on localhost:5004
- Login works
- Core features functional

✅ **Production Deployment Complete:**
- App accessible at pos-cafelux-main.vercel.app
- Database connected
- All features working

---

**Next Action:** Run database migrations di Supabase SQL Editor, lalu test koneksi dengan `node test-supabase-connection.js`
