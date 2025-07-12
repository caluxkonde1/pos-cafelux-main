const fs = require('fs');

console.log('🚀 Setup Supabase Database untuk Navicat');
console.log('=' .repeat(50));

function setupSupabaseForNavicat() {
  console.log('📋 LANGKAH-LANGKAH SETUP SUPABASE:');
  console.log('');
  
  console.log('1️⃣ BUAT AKUN SUPABASE');
  console.log('   • Kunjungi: https://supabase.com');
  console.log('   • Sign up dengan email atau GitHub');
  console.log('   • Klik "New Project"');
  console.log('');
  
  console.log('2️⃣ SETUP PROJECT');
  console.log('   • Organization: Pilih atau buat baru');
  console.log('   • Name: pos-cafelux');
  console.log('   • Database Password: Buat password yang kuat');
  console.log('   • Region: Southeast Asia (Singapore)');
  console.log('   • Klik "Create new project"');
  console.log('');
  
  console.log('3️⃣ DAPATKAN CONNECTION DETAILS');
  console.log('   • Tunggu project selesai dibuat (~2 menit)');
  console.log('   • Masuk ke Settings → Database');
  console.log('   • Scroll ke "Connection parameters"');
  console.log('   • Catat informasi berikut:');
  console.log('     - Host: db.xxx.supabase.co');
  console.log('     - Database name: postgres');
  console.log('     - Port: 5432');
  console.log('     - User: postgres');
  console.log('     - Password: [password yang Anda buat]');
  console.log('');
  
  console.log('4️⃣ SETUP NAVICAT');
  console.log('   • Buka Navicat');
  console.log('   • New Connection → PostgreSQL');
  console.log('   • Connection Name: POS CafeLux Supabase');
  console.log('   • Host: [dari step 3]');
  console.log('   • Port: 5432');
  console.log('   • Initial Database: postgres');
  console.log('   • User Name: postgres');
  console.log('   • Password: [dari step 3]');
  console.log('   • Test Connection → OK');
  console.log('');
  
  console.log('5️⃣ UPDATE APLIKASI');
  console.log('   • Buat file .env.local dengan isi:');
  
  const envTemplate = `
# Supabase Database Configuration
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
USE_LOCAL_DB=true
SKIP_DATABASE=false

# Server Configuration  
PORT=5001
NODE_ENV=development
USE_MOCK_DATA=false

# Ganti [PASSWORD] dengan password Supabase Anda
# Ganti [PROJECT_REF] dengan project reference Anda
`;

  console.log(envTemplate);
  
  // Create template .env file
  fs.writeFileSync('.env.supabase-template', envTemplate.trim());
  console.log('✅ Template .env.supabase-template dibuat');
  console.log('');
  
  console.log('6️⃣ BUAT TABLES DI SUPABASE');
  console.log('   • Masuk ke Supabase Dashboard');
  console.log('   • Klik "SQL Editor"');
  console.log('   • Copy-paste SQL schema berikut:');
  console.log('');
  
  const sqlSchema = `
-- POS CafeLux Database Schema
-- Copy paste ke Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  warna VARCHAR(7) DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kode VARCHAR(100) UNIQUE,
  kategori_id INTEGER REFERENCES categories(id),
  harga DECIMAL(10,2) NOT NULL,
  stok INTEGER DEFAULT 0,
  stok_minimum INTEGER DEFAULT 5,
  deskripsi TEXT,
  gambar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  kode_transaksi VARCHAR(100) UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed',
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (username, password, email, role) 
VALUES ('admin', 'admin123', 'admin@cafelux.com', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO categories (nama, deskripsi, warna, sort_order) VALUES
('Makanan', 'Produk makanan dan snack', '#ef4444', 1),
('Minuman', 'Minuman segar dan sehat', '#10b981', 2),
('Elektronik', 'Perangkat elektronik', '#3b82f6', 3),
('Rumah Tangga', 'Keperluan rumah tangga', '#f59e0b', 4),
('Kesehatan', 'Produk kesehatan dan kebersihan', '#8b5cf6', 5)
ON CONFLICT DO NOTHING;

INSERT INTO products (nama, kode, kategori_id, harga, stok, stok_minimum, deskripsi) VALUES
('Roti Tawar Sari Roti', 'RTW001', 1, 8500, 50, 10, 'Roti tawar segar untuk sarapan'),
('Susu Ultra 1L', 'SUS001', 2, 12000, 30, 5, 'Susu segar ultra pasteurisasi'),
('Indomie Goreng', 'IDM001', 1, 3500, 100, 20, 'Mie instan rasa ayam bawang'),
('Air Mineral Aqua 600ml', 'AQA001', 2, 3000, 200, 50, 'Air mineral dalam kemasan')
ON CONFLICT (kode) DO NOTHING;
`;

  fs.writeFileSync('supabase-schema.sql', sqlSchema.trim());
  console.log('✅ File supabase-schema.sql dibuat');
  console.log('   • Copy isi file ini ke Supabase SQL Editor');
  console.log('   • Klik "Run" untuk membuat tables');
  console.log('');
  
  console.log('7️⃣ RESTART APLIKASI');
  console.log('   • Update .env.local dengan connection string yang benar');
  console.log('   • Restart aplikasi: npm run dev');
  console.log('   • Cek logs: "✅ PostgreSQL database connection initialized successfully"');
  console.log('');
  
  console.log('🎉 SELESAI!');
  console.log('=' .repeat(50));
  console.log('✅ Database Supabase siap digunakan');
  console.log('✅ Bisa diakses dengan Navicat');
  console.log('✅ Aplikasi menggunakan database real');
  console.log('✅ Data tersimpan permanen di cloud');
  console.log('');
  
  console.log('📊 KEUNTUNGAN SUPABASE:');
  console.log('• Gratis hingga 500MB');
  console.log('• Auto backup & high availability');
  console.log('• Bisa diakses dari mana saja');
  console.log('• Real-time features');
  console.log('• Dashboard admin yang bagus');
  console.log('');
  
  console.log('🔗 LINKS PENTING:');
  console.log('• Supabase: https://supabase.com');
  console.log('• Dashboard: https://app.supabase.com');
  console.log('• Docs: https://supabase.com/docs');
}

setupSupabaseForNavicat();
