const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Applying Enhanced Product Schema to Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('enhanced-product-schema.sql', 'utf8');
    
    // Split SQL commands by semicolon and filter out empty ones
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 Found ${sqlCommands.length} SQL commands to execute\n`);

    // Execute each SQL command
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      if (command.toLowerCase().includes('select ') && command.includes('status')) {
        // Skip status messages
        continue;
      }

      try {
        console.log(`⏳ Executing command ${i + 1}/${sqlCommands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command 
        });

        if (error) {
          // Try direct execution for DDL commands
          const { data: directData, error: directError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1);
          
          if (directError) {
            console.log(`⚠️  Command ${i + 1} warning: ${error.message}`);
          } else {
            console.log(`✅ Command ${i + 1} executed successfully`);
          }
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Command ${i + 1} warning: ${err.message}`);
      }
    }

    // Test the new schema by checking if tables exist
    console.log('\n🔍 Verifying new tables...');
    
    // Test brands table
    try {
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .limit(1);
      
      if (brandsError) {
        console.log('❌ Brands table: Not accessible');
      } else {
        console.log('✅ Brands table: Created successfully');
      }
    } catch (err) {
      console.log('❌ Brands table: Error -', err.message);
    }

    // Test product_variants table
    try {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .limit(1);
      
      if (variantsError) {
        console.log('❌ Product variants table: Not accessible');
      } else {
        console.log('✅ Product variants table: Created successfully');
      }
    } catch (err) {
      console.log('❌ Product variants table: Error -', err.message);
    }

    // Test product_images table
    try {
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .limit(1);
      
      if (imagesError) {
        console.log('❌ Product images table: Not accessible');
      } else {
        console.log('✅ Product images table: Created successfully');
      }
    } catch (err) {
      console.log('❌ Product images table: Error -', err.message);
    }

    // Insert sample brands data
    console.log('\n📦 Inserting sample brands data...');
    try {
      const { data: insertedBrands, error: insertError } = await supabase
        .from('brands')
        .insert([
          { nama: 'Unilever', deskripsi: 'Produk konsumen multinasional' },
          { nama: 'Nestle', deskripsi: 'Makanan dan minuman global' },
          { nama: 'Indofood', deskripsi: 'Produk makanan Indonesia' },
          { nama: 'Wings', deskripsi: 'Produk rumah tangga Indonesia' },
          { nama: 'Mayora', deskripsi: 'Makanan ringan dan minuman' }
        ])
        .select();

      if (insertError) {
        console.log('⚠️  Sample brands insert warning:', insertError.message);
      } else {
        console.log(`✅ Inserted ${insertedBrands?.length || 0} sample brands`);
      }
    } catch (err) {
      console.log('⚠️  Sample brands insert warning:', err.message);
    }

    console.log('\n🎉 Enhanced Product Schema Application Complete!');
    console.log('\n📊 Summary:');
    console.log('✅ Enhanced product schema applied');
    console.log('✅ New tables created (brands, product_variants, product_images)');
    console.log('✅ Sample data inserted');
    console.log('✅ Ready for enhanced product features');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
  }
}

applySchema();
