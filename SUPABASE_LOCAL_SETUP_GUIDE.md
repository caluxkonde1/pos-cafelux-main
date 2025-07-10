# 🚀 **SUPABASE LOCAL DEVELOPMENT SETUP GUIDE**

## 📋 **LANGKAH-LANGKAH SETUP LOCAL ENVIRONMENT**

### **1. PERSIAPAN SUPABASE PROJECT**

#### **A. Buat Supabase Project (jika belum ada)**
1. **Kunjungi**: https://supabase.com/dashboard
2. **Login** dengan akun GitHub/Google
3. **Klik**: "New Project"
4. **Isi**:
   - Project Name: `pos-cafelux`
   - Database Password: (buat password yang kuat)
   - Region: `Southeast Asia (Singapore)`
5. **Tunggu** project selesai dibuat (~2 menit)

#### **B. Dapatkan Kredensial Supabase**
1. **Buka** project Supabase Anda
2. **Go to**: Settings > Database
3. **Copy** Connection String:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. **Go to**: Settings > API
5. **Copy**:
   - Project URL: `https://[PROJECT-REF].supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### **2. SETUP LOCAL ENVIRONMENT**

#### **A. Copy Environment Template**
```bash
# Copy template file
cp .env.local.example .env.local
```

#### **B. Edit .env.local File**
Buka file `.env.local` dan isi dengan kredensial Supabase Anda:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Supabase API Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=your-super-secret-session-key-here
```

#### **C. Contoh Pengisian (ganti dengan nilai asli Anda)**
```env
# CONTOH - GANTI DENGAN NILAI ASLI ANDA
DATABASE_URL=postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0ODAwMCwiZXhwIjoxOTUyMTI0MDAwfQ.example_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NTQ4MDAwLCJleHAiOjE5NTIxMjQwMDB9.example_service_role_key
```

---

### **3. SETUP DATABASE SCHEMA**

#### **A. Buat Tables di Supabase**
1. **Buka** Supabase Dashboard
2. **Go to**: SQL Editor
3. **Copy & Paste** script berikut:

```sql
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Transaction Items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Kopi', 'Berbagai jenis minuman kopi'),
('Makanan', 'Makanan ringan dan berat'),
('Minuman Non-Kopi', 'Teh, jus, dan minuman lainnya')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (code, name, description, price, stock, category_id) VALUES
('KOPI001', 'Americano', 'Kopi hitam klasik', 15000, 100, (SELECT id FROM categories WHERE name = 'Kopi' LIMIT 1)),
('KOPI002', 'Cappuccino', 'Kopi dengan foam susu', 20000, 100, (SELECT id FROM categories WHERE name = 'Kopi' LIMIT 1)),
('KOPI003', 'Latte', 'Kopi dengan susu steamed', 22000, 100, (SELECT id FROM categories WHERE name = 'Kopi' LIMIT 1)),
('FOOD001', 'Croissant', 'Roti pastry Prancis', 12000, 50, (SELECT id FROM categories WHERE name = 'Makanan' LIMIT 1)),
('DRINK001', 'Teh Tarik', 'Teh dengan susu', 8000, 100, (SELECT id FROM categories WHERE name = 'Minuman Non-Kopi' LIMIT 1))
ON CONFLICT DO NOTHING;
```

4. **Klik**: "Run" untuk execute script

#### **B. Enable Row Level Security (RLS)**
```sql
-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for development)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON transaction_items FOR ALL USING (true);
```

---

### **4. INSTALL DEPENDENCIES & RUN LOCAL**

#### **A. Install Dependencies**
```bash
# Install semua dependencies
npm install

# Install Supabase client (jika belum ada)
npm install @supabase/supabase-js
```

#### **B. Run Development Server**
```bash
# Start local development server
npm run dev
```

#### **C. Akses Aplikasi**
- **URL**: http://localhost:3000
- **Database**: Terhubung ke Supabase PostgreSQL
- **Data**: Persistent dan real-time

---

### **5. VERIFIKASI KONEKSI**

#### **A. Test Database Connection**
```bash
# Test koneksi database
node check-database-connection.js
```

#### **B. Expected Output**
```
✅ Database connection successful!
✅ Connected to: Supabase PostgreSQL
✅ Tables found: users, categories, products, customers, transactions, transaction_items
```

#### **C. Test di Browser**
1. **Buka**: http://localhost:3000
2. **Cek**: Dashboard menampilkan data
3. **Test**: Tambah produk baru
4. **Verify**: Data tersimpan di Supabase

---

### **6. TROUBLESHOOTING**

#### **A. Connection Error**
```bash
Error: getaddrinfo ENOTFOUND
```
**Solution**: 
- Cek DATABASE_URL di .env.local
- Pastikan password dan project ref benar
- Cek koneksi internet

#### **B. Authentication Error**
```bash
Error: Invalid API key
```
**Solution**:
- Cek SUPABASE_ANON_KEY di .env.local
- Pastikan key dari Settings > API
- Regenerate key jika perlu

#### **C. Permission Error**
```bash
Error: permission denied for table
```
**Solution**:
- Enable RLS policies
- Check user permissions di Supabase
- Use service role key untuk admin operations

---

### **7. DEVELOPMENT WORKFLOW**

#### **A. Daily Development**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

#### **B. Database Changes**
1. **Make changes** di Supabase SQL Editor
2. **Test locally** di http://localhost:3000
3. **Document changes** di migration files
4. **Deploy** ke production

#### **C. Environment Sync**
- **Local**: .env.local (Supabase)
- **Production**: Vercel Environment Variables (Supabase)
- **Database**: Same Supabase project untuk consistency

---

### **8. PRODUCTION DEPLOYMENT**

#### **A. Vercel Environment Variables**
Di Vercel Dashboard, set:
```
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### **B. Deploy**
```bash
# Deploy to Vercel
git push origin main
# Auto-deploy via Vercel GitHub integration
```

---

## 🎯 **QUICK START CHECKLIST**

### **✅ Setup Checklist:**
- [ ] Buat Supabase project
- [ ] Copy kredensial dari Supabase Dashboard
- [ ] Copy .env.local.example ke .env.local
- [ ] Isi .env.local dengan kredensial asli
- [ ] Run SQL script untuk create tables
- [ ] npm install
- [ ] npm run dev
- [ ] Test di http://localhost:3000

### **✅ Verification Checklist:**
- [ ] Dashboard loads dengan data
- [ ] Bisa tambah produk baru
- [ ] Data tersimpan di Supabase
- [ ] Real-time updates working
- [ ] No console errors

**🎉 Setelah checklist complete, aplikasi POS CafeLux siap untuk development local dengan Supabase!**
