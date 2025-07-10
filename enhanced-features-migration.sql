-- Enhanced POS CafeLux Features Migration
-- This script adds all the advanced features requested

-- 1. Create outlets table for multi-branch support
CREATE TABLE IF NOT EXISTS outlets (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT NOT NULL,
  telepon TEXT,
  email TEXT,
  kode_outlet TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Add new columns to users table for enhanced authentication
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS outlet_id INTEGER REFERENCES outlets(id),
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update role enum to include supervisor
ALTER TABLE users 
ALTER COLUMN role TYPE TEXT;

-- 3. Add new columns to products table for enhanced inventory
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS kategori_id INTEGER REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS harga_beli DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stok_minimal INTEGER NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS satuan TEXT NOT NULL DEFAULT 'pcs',
ADD COLUMN IF NOT EXISTS pajak DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS diskon_maksimal DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS outlet_id INTEGER REFERENCES outlets(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- 4. Add new columns to transactions table for enhanced POS
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS outlet_id INTEGER REFERENCES outlets(id),
ADD COLUMN IF NOT EXISTS diskon_persen DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS jumlah_bayar DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS kembalian DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS catatan TEXT,
ADD COLUMN IF NOT EXISTS is_printed BOOLEAN NOT NULL DEFAULT false;

-- 5. Create stock movements table for inventory tracking
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  outlet_id INTEGER REFERENCES outlets(id),
  type TEXT NOT NULL, -- 'in', 'out', 'adjustment', 'transfer'
  quantity INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT, -- 'purchase', 'sale', 'adjustment', 'transfer', 'expired'
  reference_id INTEGER, -- Transaction ID or other reference
  user_id INTEGER NOT NULL REFERENCES users(id),
  catatan TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  type TEXT NOT NULL, -- 'percentage', 'fixed'
  value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(12,2) DEFAULT 0,
  max_discount DECIMAL(12,2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Create backup logs table
CREATE TABLE IF NOT EXISTS backup_logs (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- 'manual', 'automatic'
  status TEXT NOT NULL, -- 'success', 'failed', 'in_progress'
  file_path TEXT,
  file_size INTEGER,
  error_message TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Create printer settings table
CREATE TABLE IF NOT EXISTS printer_settings (
  id SERIAL PRIMARY KEY,
  outlet_id INTEGER NOT NULL REFERENCES outlets(id),
  printer_name TEXT NOT NULL,
  printer_type TEXT NOT NULL, -- 'thermal', 'inkjet', 'laser'
  paper_size TEXT NOT NULL DEFAULT '80mm',
  is_default BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. Insert default outlet
INSERT INTO outlets (nama, alamat, kode_outlet) 
VALUES ('Outlet Utama', 'Jl. Raya No. 1', 'OUT001')
ON CONFLICT (kode_outlet) DO NOTHING;

-- 10. Update existing products to have kategori_id
UPDATE products 
SET kategori_id = (
  SELECT id FROM categories 
  WHERE categories.nama = products.kategori 
  LIMIT 1
)
WHERE kategori_id IS NULL;

-- 11. Insert sample discounts
INSERT INTO discounts (nama, type, value, min_purchase, is_active) VALUES
('Diskon Member 10%', 'percentage', 10.00, 50000, true),
('Diskon Hari Raya', 'percentage', 15.00, 100000, true),
('Diskon Pembelian Besar', 'fixed', 25000, 200000, true)
ON CONFLICT DO NOTHING;

-- 12. Insert default printer settings
INSERT INTO printer_settings (outlet_id, printer_name, printer_type, paper_size, is_default) 
SELECT 1, 'Default Thermal Printer', 'thermal', '80mm', true
WHERE NOT EXISTS (SELECT 1 FROM printer_settings WHERE outlet_id = 1);

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_outlet_id ON stock_movements(outlet_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_kategori_id ON products(kategori_id);
CREATE INDEX IF NOT EXISTS idx_products_stok_minimal ON products(stok_minimal);
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_id ON transactions(outlet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_printed ON transactions(is_printed);

-- 14. Create triggers for automatic stock movement logging
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.stok != NEW.stok THEN
    INSERT INTO stock_movements (
      product_id, 
      type, 
      quantity, 
      quantity_before, 
      quantity_after, 
      reason, 
      user_id
    ) VALUES (
      NEW.id,
      CASE WHEN NEW.stok > OLD.stok THEN 'in' ELSE 'out' END,
      ABS(NEW.stok - OLD.stok),
      OLD.stok,
      NEW.stok,
      'adjustment',
      1 -- Default to admin user, should be updated with actual user
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_stock_movement
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_movement();

-- 15. Update user permissions with default role-based permissions
UPDATE users SET permissions = 
CASE 
  WHEN role = 'admin' THEN '{"all": true}'::jsonb
  WHEN role = 'pemilik' THEN '{"view_reports": true, "manage_users": true, "manage_products": true, "view_transactions": true}'::jsonb
  WHEN role = 'supervisor' THEN '{"manage_products": true, "view_reports": true, "manage_transactions": true}'::jsonb
  WHEN role = 'kasir' THEN '{"create_transactions": true, "view_products": true}'::jsonb
  ELSE '{}'::jsonb
END
WHERE permissions = '{}'::jsonb OR permissions IS NULL;

COMMIT;
