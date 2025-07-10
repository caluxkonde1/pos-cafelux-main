-- POS CafeLux Database Migration Script for Supabase
-- This script creates all tables and initial data for the POS system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS dashboard_stats CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin', -- admin, kasir, pemilik
    subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'pro_plus')),
    subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    subscription_expires_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    kode TEXT NOT NULL UNIQUE,
    kategori TEXT NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    stok INTEGER NOT NULL DEFAULT 0,
    deskripsi TEXT,
    gambar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    email TEXT,
    telepon TEXT,
    alamat TEXT,
    total_pembelian DECIMAL(12,2) NOT NULL DEFAULT 0,
    jumlah_transaksi INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    nomor_transaksi TEXT NOT NULL UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    kasir_id INTEGER NOT NULL REFERENCES users(id),
    subtotal DECIMAL(12,2) NOT NULL,
    pajak DECIMAL(12,2) NOT NULL DEFAULT 0,
    diskon DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    metode_pembayaran TEXT NOT NULL, -- tunai, kartu, ewallet, qris
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Transaction Items table
CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    nama_produk TEXT NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    jumlah INTEGER NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

-- Create Dashboard Stats table
CREATE TABLE dashboard_stats (
    id SERIAL PRIMARY KEY,
    tanggal TIMESTAMP NOT NULL,
    penjualan_harian DECIMAL(12,2) NOT NULL,
    total_transaksi INTEGER NOT NULL,
    produk_terjual INTEGER NOT NULL,
    pelanggan_baru INTEGER NOT NULL
);

-- Create Subscription Plans table
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IDR',
    interval TEXT NOT NULL DEFAULT 'monthly',
    features JSONB NOT NULL,
    max_products INTEGER,
    max_employees INTEGER,
    max_outlets INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Features table
CREATE TABLE features (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- basic, analytics, advanced, integration
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Insert initial admin user
INSERT INTO users (username, password, email, nama, role, subscription_plan, subscription_status, is_active) VALUES
('admin', 'admin123', 'admin@qasir.com', 'Admin Toko', 'admin', 'pro_plus', 'active', true);

-- Insert categories
INSERT INTO categories (nama, deskripsi, is_active) VALUES
('Makanan', 'Produk makanan dan minuman', true),
('Minuman', 'Berbagai jenis minuman', true),
('Snack', 'Camilan dan makanan ringan', true),
('Sembako', 'Kebutuhan pokok sehari-hari', true),
('Personal Care', 'Produk perawatan diri', true),
('Kesehatan', 'Produk kesehatan dan kebersihan', true),
('Rumah Tangga', 'Kebutuhan rumah tangga', true);

-- Insert sample products
INSERT INTO products (nama, kode, kategori, harga, stok, deskripsi, is_active) VALUES
('Roti Tawar Sari Roti', 'RTW001', 'Makanan', 8500, 50, 'Roti tawar berkualitas untuk sarapan', true),
('Susu Ultra 1L', 'SUL001', 'Minuman', 12000, 30, 'Susu UHT rasa plain', true),
('Indomie Goreng', 'IMG001', 'Makanan', 3500, 100, 'Mie instan rasa ayam bawang', true),
('Teh Botol Sosro', 'TBS001', 'Minuman', 5000, 75, 'Teh manis dalam botol', true),
('Sabun Mandi Lifebuoy', 'SML001', 'Kesehatan', 8000, 40, 'Sabun mandi antibakteri', true),
('Beras Premium 5kg', 'BRP001', 'Makanan', 65000, 25, 'Beras premium kualitas terbaik', true),
('Minyak Goreng Tropical 2L', 'MGT001', 'Rumah Tangga', 28000, 20, 'Minyak goreng kelapa sawit', true),
('Gula Pasir 1kg', 'GPS001', 'Makanan', 15000, 35, 'Gula pasir berkualitas', true);

-- Insert sample customers
INSERT INTO customers (nama, email, telepon, alamat, total_pembelian, jumlah_transaksi) VALUES
('Andi Susanto', 'andi@email.com', '08123456789', 'Jl. Sudirman No. 123, Jakarta', 0, 0),
('Sari Dewi', 'sari@email.com', '08198765432', 'Jl. Thamrin No. 456, Jakarta', 0, 0),
('Budi Hartono', 'budi@email.com', '08555123456', 'Jl. Gatot Subroto No. 789, Jakarta', 0, 0),
('Lisa Permata', 'lisa@email.com', '08777888999', 'Jl. Kuningan No. 321, Jakarta', 0, 0),
('Riko Pratama', 'riko@email.com', '08333444555', 'Jl. Senayan No. 654, Jakarta', 0, 0);

-- Insert subscription plans
INSERT INTO subscription_plans (name, price, currency, interval, features, max_products, max_employees, max_outlets, is_active) VALUES
('Free', 0, 'IDR', 'monthly', '["basic_pos", "inventory_management"]', 50, 1, 1, true),
('Pro', 99000, 'IDR', 'monthly', '["basic_pos", "inventory_management", "reports", "customer_management"]', 500, 5, 3, true),
('Pro Plus', 199000, 'IDR', 'monthly', '["basic_pos", "inventory_management", "reports", "customer_management", "advanced_analytics", "multi_outlet", "api_access"]', -1, -1, -1, true);

-- Insert features
INSERT INTO features (name, display_name, description, category, is_active) VALUES
('basic_pos', 'Basic POS', 'Point of sale functionality', 'basic', true),
('inventory_management', 'Inventory Management', 'Product and stock management', 'basic', true),
('reports', 'Reports', 'Sales and inventory reports', 'analytics', true),
('customer_management', 'Customer Management', 'Customer database and loyalty', 'basic', true),
('advanced_analytics', 'Advanced Analytics', 'Detailed business insights', 'analytics', true),
('multi_outlet', 'Multi Outlet', 'Multiple store locations', 'advanced', true),
('api_access', 'API Access', 'Third-party integrations', 'integration', true);

-- Create indexes for better performance
CREATE INDEX idx_products_kode ON products(kode);
CREATE INDEX idx_products_kategori ON products(kategori);
CREATE INDEX idx_transactions_nomor ON transactions(nomor_transaksi);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (you can modify these based on your needs)
CREATE POLICY "Enable all operations for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON transaction_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON dashboard_stats FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON subscription_plans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON features FOR SELECT USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'POS CafeLux database migration completed successfully!' as status;
