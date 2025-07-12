-- =====================================================
-- COMPLETE DATABASE SETUP FOR POS CAFELUX
-- Run this in Supabase SQL Editor to create all tables
-- =====================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Create outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL UNIQUE,
  deskripsi TEXT,
  logo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kode VARCHAR(100) UNIQUE,
  deskripsi TEXT,
  harga DECIMAL(10, 2) NOT NULL,
  harga_beli DECIMAL(10, 2),
  stok INTEGER NOT NULL DEFAULT 0,
  stok_minimal INTEGER NOT NULL DEFAULT 5,
  kategori_id INTEGER REFERENCES categories(id),
  brand_id INTEGER REFERENCES brands(id),
  barcode VARCHAR(255) UNIQUE,
  foto TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_produk_favorit BOOLEAN NOT NULL DEFAULT false,
  has_variants BOOLEAN NOT NULL DEFAULT false,
  primary_image_url TEXT,
  wholesale_price DECIMAL(10, 2),
  wholesale_min_qty INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL,
  harga DECIMAL(10, 2) NOT NULL,
  harga_beli DECIMAL(10, 2),
  stok INTEGER NOT NULL DEFAULT 0,
  stok_minimal INTEGER NOT NULL DEFAULT 5,
  barcode VARCHAR(255) UNIQUE,
  sku VARCHAR(100) UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'kasir',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telepon VARCHAR(20),
  alamat TEXT,
  tanggal_lahir DATE,
  tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
  role VARCHAR(50) NOT NULL DEFAULT 'kasir',
  status VARCHAR(20) NOT NULL DEFAULT 'aktif',
  gaji DECIMAL(12, 2),
  jam_kerja VARCHAR(50) DEFAULT '08:00-17:00',
  outlet_id INTEGER REFERENCES outlets(id),
  permissions TEXT[],
  catatan TEXT,
  foto_profile TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telepon VARCHAR(20),
  alamat TEXT,
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20),
  pekerjaan VARCHAR(100),
  catatan TEXT,
  total_transaksi INTEGER NOT NULL DEFAULT 0,
  total_belanja DECIMAL(12, 2) NOT NULL DEFAULT 0,
  poin_loyalitas INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'aktif',
  kategori VARCHAR(20) NOT NULL DEFAULT 'reguler',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 10. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  kode_transaksi VARCHAR(100) NOT NULL UNIQUE,
  tanggal TIMESTAMP NOT NULL DEFAULT NOW(),
  customer_id INTEGER REFERENCES customers(id),
  user_id INTEGER REFERENCES users(id),
  outlet_id INTEGER REFERENCES outlets(id),
  total_item INTEGER NOT NULL DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  diskon DECIMAL(12, 2) NOT NULL DEFAULT 0,
  pajak DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  bayar DECIMAL(12, 2) NOT NULL DEFAULT 0,
  kembalian DECIMAL(12, 2) NOT NULL DEFAULT 0,
  metode_pembayaran VARCHAR(50) NOT NULL DEFAULT 'tunai',
  status VARCHAR(20) NOT NULL DEFAULT 'selesai',
  catatan TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 11. Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_variant_id INTEGER REFERENCES product_variants(id),
  nama_produk VARCHAR(255) NOT NULL,
  harga DECIMAL(10, 2) NOT NULL,
  qty INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  tanggal_reminder DATE NOT NULL,
  waktu_reminder TIME,
  tipe VARCHAR(50) NOT NULL DEFAULT 'umum',
  status VARCHAR(20) NOT NULL DEFAULT 'aktif',
  user_id INTEGER REFERENCES users(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 13. Create cash_flow table
CREATE TABLE IF NOT EXISTS cash_flow (
  id SERIAL PRIMARY KEY,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  tipe VARCHAR(20) NOT NULL, -- 'masuk' atau 'keluar'
  kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT NOT NULL,
  jumlah DECIMAL(12, 2) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  outlet_id INTEGER REFERENCES outlets(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_kategori_id ON products(kategori_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_favorit ON products(is_produk_favorit);
CREATE INDEX IF NOT EXISTS idx_products_variants ON products(has_variants);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tanggal ON transactions(tanggal);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reminders_tanggal ON reminders(tanggal_reminder);
CREATE INDEX IF NOT EXISTS idx_cash_flow_tanggal ON cash_flow(tanggal);

-- 15. Insert sample data

-- Sample outlets
INSERT INTO outlets (nama, alamat, telepon) VALUES
('Outlet Utama', 'Jl. Raya No. 123, Jakarta', '021-12345678'),
('Cabang Mall', 'Mall ABC Lt. 2, Jakarta', '021-87654321')
ON CONFLICT (nama) DO NOTHING;

-- Sample categories
INSERT INTO categories (nama, deskripsi, icon) VALUES
('Makanan', 'Produk makanan dan snack', 'utensils'),
('Minuman', 'Minuman segar dan kemasan', 'coffee'),
('Elektronik', 'Peralatan elektronik', 'zap'),
('Rumah Tangga', 'Kebutuhan rumah tangga', 'home'),
('Kesehatan', 'Produk kesehatan dan kecantikan', 'heart')
ON CONFLICT (nama) DO NOTHING;

-- Sample brands
INSERT INTO brands (nama, deskripsi) VALUES
('Unilever', 'Produk konsumen multinasional'),
('Nestle', 'Makanan dan minuman global'),
('Indofood', 'Produk makanan Indonesia'),
('Wings', 'Produk rumah tangga Indonesia'),
('Mayora', 'Makanan ringan dan minuman'),
('Orang Tua', 'Produk kopi dan minuman'),
('ABC', 'Saus dan bumbu masakan'),
('Indomie', 'Mie instan terpopuler'),
('Teh Botol Sosro', 'Minuman teh dalam kemasan'),
('Aqua', 'Air minum dalam kemasan')
ON CONFLICT (nama) DO NOTHING;

-- Sample users
INSERT INTO users (username, password, nama, role) VALUES
('admin', 'admin123', 'Administrator', 'admin'),
('kasir1', 'kasir123', 'Kasir 1', 'kasir'),
('kasir2', 'kasir123', 'Kasir 2', 'kasir'),
('supervisor', 'super123', 'Supervisor', 'supervisor')
ON CONFLICT (username) DO NOTHING;

-- Sample employees
INSERT INTO employees (nama, username, password, role, status) VALUES
('Admin System', 'admin', 'admin123', 'admin', 'aktif'),
('Supervisor Toko', 'supervisor', 'super123', 'supervisor', 'aktif'),
('Kasir 1', 'kasir1', 'kasir123', 'kasir', 'aktif'),
('Kasir 2', 'kasir2', 'kasir123', 'kasir', 'aktif')
ON CONFLICT (username) DO NOTHING;

-- Sample products
INSERT INTO products (nama, kode, harga, harga_beli, stok, kategori_id, brand_id, is_produk_favorit) VALUES
('Roti Tawar Sari Roti', 'RTW001', 12000, 10000, 50, 1, 3, true),
('Indomie Goreng', 'IMG001', 3500, 3000, 100, 1, 8, true),
('Aqua 600ml', 'AQU600', 3000, 2500, 80, 2, 10, false),
('Teh Botol Sosro 450ml', 'TBS450', 4500, 4000, 60, 2, 9, true),
('Sabun Lifebuoy', 'SLB001', 8000, 7000, 40, 4, 1, false)
ON CONFLICT (kode) DO NOTHING;

-- Sample customers
INSERT INTO customers (nama, email, telepon, kategori, poin_loyalitas) VALUES
('John Doe', 'john@email.com', '08123456789', 'reguler', 100),
('Jane Smith', 'jane@email.com', '08987654321', 'vip', 500),
('Bob Wilson', 'bob@email.com', '08555666777', 'premium', 1000)
ON CONFLICT DO NOTHING;

-- Sample reminders
INSERT INTO reminders (judul, deskripsi, tanggal_reminder, tipe, user_id) VALUES
('Cek Stok Mingguan', 'Periksa stok produk yang hampir habis', CURRENT_DATE + INTERVAL '1 day', 'stok', 1),
('Meeting Bulanan', 'Rapat evaluasi penjualan bulan ini', CURRENT_DATE + INTERVAL '7 days', 'meeting', 1),
('Bayar Supplier', 'Pembayaran ke supplier ABC', CURRENT_DATE + INTERVAL '3 days', 'pembayaran', 1)
ON CONFLICT DO NOTHING;

-- 16. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 17. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 18. Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 19. Create RLS policies (optional - uncomment if needed)
-- CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
-- CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);

-- Final success message
SELECT 'Complete POS CafeLux database setup completed successfully!' as status,
       'All tables, indexes, triggers, and sample data have been created.' as message;
