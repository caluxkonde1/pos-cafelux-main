// Script to extract data from Replit Neon database
// Run this script to get your existing data before migrating to Supabase

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

// Replit Neon Database Configuration
const NEON_CONFIG = {
  connectionString: "postgresql://neondb_owner:npg_7Rkofzeq2vBF@ep-icy-frog-afe0mmhy.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
};

async function extractData() {
  const pool = new Pool(NEON_CONFIG);
  
  try {
    console.log('🔗 Connecting to Replit Neon database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Extract data from each table
    const tables = [
      'users',
      'categories', 
      'products',
      'customers',
      'transactions',
      'transaction_items',
      'subscription_plans',
      'features',
      'dashboard_stats'
    ];
    
    const extractedData = {};
    
    for (const table of tables) {
      try {
        console.log(`📊 Extracting data from ${table}...`);
        const result = await client.query(`SELECT * FROM ${table} ORDER BY id`);
        extractedData[table] = result.rows;
        console.log(`   Found ${result.rows.length} records in ${table}`);
      } catch (error) {
        console.log(`   ⚠️  Table ${table} not found or error: ${error.message}`);
        extractedData[table] = [];
      }
    }
    
    // Generate SQL INSERT statements
    console.log('\n📝 Generating SQL INSERT statements...');
    
    let sqlOutput = '-- Extracted data from Replit Neon Database\n';
    sqlOutput += '-- Run this after the main migration script\n\n';
    
    for (const [tableName, rows] of Object.entries(extractedData)) {
      if (rows.length > 0) {
        sqlOutput += `-- Data for ${tableName} table\n`;
        sqlOutput += `DELETE FROM ${tableName};\n`;
        
        // Reset sequence
        sqlOutput += `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), 1, false);\n`;
        
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return val;
          });
          
          sqlOutput += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        // Reset sequence to max ID + 1
        sqlOutput += `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE((SELECT MAX(id) FROM ${tableName}), 1), true);\n`;
        sqlOutput += '\n';
      }
    }
    
    // Save to file
    fs.writeFileSync('extracted-neon-data.sql', sqlOutput);
    
    console.log('✅ Data extraction completed!');
    console.log('📁 SQL file saved as: extracted-neon-data.sql');
    console.log('\n📋 Summary:');
    
    for (const [tableName, rows] of Object.entries(extractedData)) {
      console.log(`   ${tableName}: ${rows.length} records`);
    }
    
    console.log('\n🚀 Next steps:');
    console.log('1. Run the main migration script (supabase-migration.sql) in Supabase');
    console.log('2. Then run the extracted data script (extracted-neon-data.sql) in Supabase');
    console.log('3. Update your .env file with Supabase credentials');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error extracting data:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check if the Neon database is still accessible');
    console.log('- Verify the connection string is correct');
    console.log('- Ensure you have network access to the database');
  } finally {
    await pool.end();
  }
}

// Run the extraction
extractData().catch(console.error);
