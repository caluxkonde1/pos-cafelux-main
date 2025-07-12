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