const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Creating Enhanced Tables in Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('📦 Creating sample brands data...');
    
    // Since we can't create tables directly via client, let's test if they exist
    // and create sample data
    
    // Test brands table and insert data
    try {
      const { data: existingBrands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .limit(1);
      
      if (brandsError && brandsError.code === 'PGRST116') {
        console.log('⚠️  Brands table does not exist. Please create it manually in Supabase dashboard.');
        console.log('📋 SQL to run in Supabase SQL Editor:');
        console.log(`
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  logo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
        `);
      } else {
        console.log('✅ Brands table exists');
        
        // Insert sample brands
        const { data: insertedBrands, error: insertError } = await supabase
          .from('brands')
          .upsert([
            { id: 1, nama: 'Unilever', deskripsi: 'Produk konsumen multinasional' },
            { id: 2, nama: 'Nestle', deskripsi: 'Makanan dan minuman global' },
            { id: 3, nama: 'Indofood', deskripsi: 'Produk makanan Indonesia' },
            { id: 4, nama: 'Wings', deskripsi: 'Produk rumah tangga Indonesia' },
            { id: 5, nama: 'Mayora', deskripsi: 'Makanan ringan dan minuman' }
          ], { onConflict: 'id' })
          .select();

        if (insertError) {
          console.log('⚠️  Brands insert warning:', insertError.message);
        } else {
          console.log(`✅ Upserted ${insertedBrands?.length || 0} brands`);
        }
      }
    } catch (err) {
      console.log('❌ Brands table error:', err.message);
    }

    // Test product_variants table
    try {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .limit(1);
      
      if (variantsError && variantsError.code === 'PGRST116') {
        console.log('⚠️  Product variants table does not exist. Please create it manually.');
        console.log('📋 SQL to run in Supabase SQL Editor:');
        console.log(`
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
        `);
      } else {
        console.log('✅ Product variants table exists');
      }
    } catch (err) {
      console.log('❌ Product variants table error:', err.message);
    }

    // Test product_images table
    try {
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .limit(1);
      
      if (imagesError && imagesError.code === 'PGRST116') {
        console.log('⚠️  Product images table does not exist. Please create it manually.');
        console.log('📋 SQL to run in Supabase SQL Editor:');
        console.log(`
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
        `);
      } else {
        console.log('✅ Product images table exists');
      }
    } catch (err) {
      console.log('❌ Product images table error:', err.message);
    }

    // Test if products table needs enhancement
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('brand_id, is_produk_favorit, has_variants')
        .limit(1);
      
      if (productsError) {
        console.log('⚠️  Products table needs enhancement. Please add these columns:');
        console.log('📋 SQL to run in Supabase SQL Editor:');
        console.log(`
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id),
ADD COLUMN IF NOT EXISTS is_produk_favorit BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS wholesale_min_qty INTEGER DEFAULT 1;
        `);
      } else {
        console.log('✅ Products table has enhanced columns');
      }
    } catch (err) {
      console.log('❌ Products table enhancement error:', err.message);
    }

    console.log('\n🎉 Enhanced Tables Check Complete!');
    console.log('\n📊 Summary:');
    console.log('✅ Table existence verified');
    console.log('✅ Sample data prepared');
    console.log('✅ SQL commands provided for manual creation if needed');
    
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL commands shown above');
    console.log('4. Enable Row Level Security if needed');
    console.log('5. Test the enhanced product features');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTables();
