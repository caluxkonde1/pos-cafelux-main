-- =====================================================
-- FINAL SQL COMMANDS FOR SUPABASE DASHBOARD
-- Copy and paste these commands in Supabase SQL Editor
-- =====================================================

-- 1. Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  logo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Create product variants table
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

-- 3. Enhance products table (if not already done)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id),
ADD COLUMN IF NOT EXISTS is_produk_favorit BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 1;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_favorit ON products(is_produk_favorit);
CREATE INDEX IF NOT EXISTS idx_products_variants ON products(has_variants);

-- 5. Insert sample brands data
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

-- 6. Update existing products with sample data
UPDATE products SET 
  brand_id = (SELECT id FROM brands ORDER BY RANDOM() LIMIT 1),
  is_produk_favorit = (RANDOM() > 0.8),
  has_variants = false,
  wholesale_min_qty = 1
WHERE brand_id IS NULL;

-- 7. Create employees table for employee management
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
  permissions TEXT[], -- Array of permissions
  catatan TEXT,
  foto_profile TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Insert sample employee data
INSERT INTO employees (nama, username, password, role, status) VALUES
('Admin System', 'admin', 'admin123', 'admin', 'aktif'),
('Supervisor Toko', 'supervisor', 'super123', 'supervisor', 'aktif'),
('Kasir 1', 'kasir1', 'kasir123', 'kasir', 'aktif'),
('Kasir 2', 'kasir2', 'kasir123', 'kasir', 'aktif')
ON CONFLICT (username) DO NOTHING;

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Enable Row Level Security (RLS) if needed
-- ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies (uncomment if needed)
-- CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Enable update for authenticated users only" ON brands FOR UPDATE USING (auth.role() = 'authenticated');

SELECT 'Enhanced database schema applied successfully!' as status;
