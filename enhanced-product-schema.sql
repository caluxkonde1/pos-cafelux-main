-- Enhanced Product Schema for POS CafeLux
-- Add support for product variants, brands, and enhanced product features

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  logo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create product variants table
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

-- Create product images table
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255),
  image_size INTEGER,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add new columns to existing products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id),
ADD COLUMN IF NOT EXISTS is_produk_favorit BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 1;

-- Insert sample brands
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
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_favorit ON products(is_produk_favorit);

-- Create function to update product updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_updated_at();

DROP TRIGGER IF EXISTS trigger_update_product_variants_updated_at ON product_variants;
CREATE TRIGGER trigger_update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_updated_at();

-- Update existing products to have some sample data
UPDATE products SET 
  brand_id = (SELECT id FROM brands ORDER BY RANDOM() LIMIT 1),
  is_produk_favorit = (RANDOM() > 0.7)
WHERE brand_id IS NULL;

SELECT 'Enhanced product schema created successfully!' as status;
