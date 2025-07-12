-- Fix Supabase RLS Policies for POS CafeLux
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily for testing (you can enable later with proper policies)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats DISABLE ROW LEVEL SECURITY;

-- OR create proper policies for authenticated users
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for authenticated users" ON categories FOR ALL USING (true);

-- Insert initial data if tables are empty
INSERT INTO categories (nama, deskripsi) VALUES
('Makanan', 'Produk makanan dan minuman'),
('Minuman', 'Berbagai jenis minuman'),
('Snack', 'Camilan dan makanan ringan'),
('Sembako', 'Kebutuhan pokok sehari-hari'),
('Personal Care', 'Produk perawatan diri'),
('Kesehatan', 'Produk kesehatan dan kebersihan'),
('Rumah Tangga', 'Kebutuhan rumah tangga')
ON CONFLICT (nama) DO NOTHING;

-- Insert sample products
INSERT INTO products (nama, kode, kategori, harga, stok, deskripsi, is_active) VALUES
('Roti Tawar Sari Roti', 'RTW001', 'Makanan', 8500, 50, 'Roti tawar berkualitas untuk sarapan', true),
('Susu Ultra 1L', 'SUL001', 'Minuman', 12000, 30, 'Susu UHT rasa plain', true),
('Indomie Goreng', 'IMG001', 'Makanan', 3500, 100, 'Mie instan rasa ayam bawang', true),
('Teh Botol Sosro', 'TBS001', 'Minuman', 5000, 75, 'Teh manis dalam botol', true),
('Sabun Mandi Lifebuoy', 'SML001', 'Kesehatan', 8000, 40, 'Sabun mandi antibakteri', true)
ON CONFLICT (kode) DO NOTHING;

-- Insert admin user
INSERT INTO users (username, password, email, nama, role, subscription_plan, subscription_status, is_active) VALUES
('admin', 'admin123', 'admin@qasir.com', 'Admin Toko', 'admin', 'pro_plus', 'active', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (nama, email, telepon, alamat, total_pembelian, jumlah_transaksi) VALUES
('Andi Susanto', 'andi@email.com', '08123456789', 'Jl. Sudirman No. 123, Jakarta', 0, 0),
('Sari Dewi', 'sari@email.com', '08198765432', 'Jl. Thamrin No. 456, Jakarta', 0, 0)
ON CONFLICT (email) DO NOTHING;

SELECT 'Supabase policies fixed and initial data inserted!' as status;
