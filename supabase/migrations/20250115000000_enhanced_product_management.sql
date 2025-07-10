-- Enhanced Product Management Features Migration
-- Fitur: Opsi Tambahan, Bundel, Bahan Baku & Resep, Image Upload, Barcode

-- 1. Product Options (Opsi Tambahan) - untuk varian produk
CREATE TABLE IF NOT EXISTS product_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Nama opsi (Size, Warna, dll)
  type VARCHAR(50) NOT NULL DEFAULT 'single', -- single, multiple
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Product Option Values (Nilai opsi)
CREATE TABLE IF NOT EXISTS product_option_values (
  id SERIAL PRIMARY KEY,
  option_id INTEGER REFERENCES product_options(id) ON DELETE CASCADE,
  value VARCHAR(255) NOT NULL, -- Small, Medium, Large
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- Tambahan harga
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Product Bundles (Bundel Produk)
CREATE TABLE IF NOT EXISTS product_bundles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  bundle_price DECIMAL(10,2) NOT NULL,
  discount_type VARCHAR(20) DEFAULT 'fixed', -- fixed, percentage
  discount_value DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bundle Items (Item dalam bundel)
CREATE TABLE IF NOT EXISTS bundle_items (
  id SERIAL PRIMARY KEY,
  bundle_id INTEGER REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Raw Materials (Bahan Baku)
CREATE TABLE IF NOT EXISTS raw_materials (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- kg, liter, pcs, dll
  cost_per_unit DECIMAL(10,2) NOT NULL,
  current_stock DECIMAL(10,3) DEFAULT 0,
  minimum_stock DECIMAL(10,3) DEFAULT 0,
  supplier_name VARCHAR(255),
  supplier_contact VARCHAR(255),
  expiry_date DATE,
  storage_location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Product Recipes (Resep Produk)
CREATE TABLE IF NOT EXISTS product_recipes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id INTEGER REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity_needed DECIMAL(10,3) NOT NULL, -- Jumlah bahan baku yang dibutuhkan
  unit VARCHAR(50) NOT NULL,
  cost_per_serving DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Product Images (Multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  file_size INTEGER, -- in bytes
  file_type VARCHAR(50), -- jpg, png, webp
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Product Favorites (Produk Favorit)
CREATE TABLE IF NOT EXISTS product_favorites (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- 9. Stock Movements Enhanced (untuk tracking bahan baku)
CREATE TABLE IF NOT EXISTS raw_material_movements (
  id SERIAL PRIMARY KEY,
  raw_material_id INTEGER REFERENCES raw_materials(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- in, out, adjustment, expired, used_in_production
  quantity DECIMAL(10,3) NOT NULL,
  quantity_before DECIMAL(10,3) NOT NULL,
  quantity_after DECIMAL(10,3) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reference_type VARCHAR(50), -- purchase, production, adjustment, expiry
  reference_id INTEGER, -- ID transaksi atau produksi
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Production Logs (Log Produksi)
CREATE TABLE IF NOT EXISTS production_logs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  quantity_produced INTEGER NOT NULL,
  production_cost DECIMAL(10,2),
  production_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  batch_number VARCHAR(100),
  quality_notes TEXT,
  produced_by INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'completed', -- in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8,3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100); -- "10x5x3 cm"
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_recipe BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS production_cost DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2);

-- Note: barcode column already exists in products table from shared/schema.ts

-- Add new columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6'; -- Hex color
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50); -- Icon name
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_option_id ON product_option_values(option_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON bundle_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_raw_material_id ON product_recipes(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_favorites_user_id ON product_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_raw_material_movements_raw_material_id ON raw_material_movements(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_production_logs_product_id ON production_logs(product_id);
-- Note: Skip barcode index since column may not exist in all environments
-- CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id) WHERE parent_id IS NOT NULL;

-- Create functions for automatic calculations
CREATE OR REPLACE FUNCTION calculate_product_cost(product_id_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_cost DECIMAL(10,2) := 0;
BEGIN
  SELECT COALESCE(SUM(pr.quantity_needed * rm.cost_per_unit), 0)
  INTO total_cost
  FROM product_recipes pr
  JOIN raw_materials rm ON pr.raw_material_id = rm.id
  WHERE pr.product_id = product_id_param;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock after production
CREATE OR REPLACE FUNCTION update_stock_after_production()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product stock
  UPDATE products 
  SET stok = stok + NEW.quantity_produced,
      production_cost = calculate_product_cost(NEW.product_id)
  WHERE id = NEW.product_id;
  
  -- Deduct raw materials
  INSERT INTO raw_material_movements (
    raw_material_id, movement_type, quantity, quantity_before, quantity_after,
    reference_type, reference_id, created_by
  )
  SELECT 
    pr.raw_material_id,
    'used_in_production',
    -(pr.quantity_needed * NEW.quantity_produced),
    rm.current_stock,
    rm.current_stock - (pr.quantity_needed * NEW.quantity_produced),
    'production',
    NEW.id,
    NEW.produced_by
  FROM product_recipes pr
  JOIN raw_materials rm ON pr.raw_material_id = rm.id
  WHERE pr.product_id = NEW.product_id;
  
  -- Update raw material stock
  UPDATE raw_materials rm
  SET current_stock = current_stock - (
    SELECT pr.quantity_needed * NEW.quantity_produced
    FROM product_recipes pr
    WHERE pr.raw_material_id = rm.id AND pr.product_id = NEW.product_id
  )
  WHERE id IN (
    SELECT raw_material_id FROM product_recipes WHERE product_id = NEW.product_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for production
CREATE TRIGGER trigger_update_stock_after_production
  AFTER INSERT ON production_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_after_production();

-- Function to update raw material stock
CREATE OR REPLACE FUNCTION update_raw_material_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE raw_materials
  SET current_stock = NEW.quantity_after
  WHERE id = NEW.raw_material_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for raw material movements
CREATE TRIGGER trigger_update_raw_material_stock
  AFTER INSERT ON raw_material_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_raw_material_stock();

-- Insert sample data for testing
INSERT INTO raw_materials (code, name, unit, cost_per_unit, current_stock, minimum_stock) VALUES
('RM001', 'Kopi Arabica', 'kg', 85000, 50, 10),
('RM002', 'Susu UHT', 'liter', 15000, 20, 5),
('RM003', 'Gula Pasir', 'kg', 12000, 25, 5),
('RM004', 'Tepung Terigu', 'kg', 8000, 30, 10),
('RM005', 'Telur', 'butir', 2500, 100, 20)
ON CONFLICT (code) DO NOTHING;

-- Insert sample product options
INSERT INTO product_options (product_id, name, type, is_required) 
SELECT p.id, 'Ukuran', 'single', true
FROM products p 
WHERE p.nama ILIKE '%kopi%' OR p.nama ILIKE '%coffee%'
ON CONFLICT DO NOTHING;

-- Insert sample option values
INSERT INTO product_option_values (option_id, value, price_adjustment)
SELECT po.id, 'Small', 0
FROM product_options po
WHERE po.name = 'Ukuran'
UNION ALL
SELECT po.id, 'Medium', 3000
FROM product_options po
WHERE po.name = 'Ukuran'
UNION ALL
SELECT po.id, 'Large', 5000
FROM product_options po
WHERE po.name = 'Ukuran'
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_material_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for development)
CREATE POLICY "Allow all operations" ON product_options FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_option_values FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_bundles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON bundle_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON raw_materials FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_recipes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_images FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON product_favorites FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON raw_material_movements FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON production_logs FOR ALL USING (true);
