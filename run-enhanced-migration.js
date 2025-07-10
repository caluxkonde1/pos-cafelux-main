import { Pool } from 'pg';
import { readFileSync } from 'fs';

const connectionString = 'postgresql://postgres.wbseybltsgfstwqqnzxg:Caluxkonde87253186@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🚀 Running Enhanced Features Migration...');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('\n📡 Connecting to Supabase...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    console.log('\n📄 Reading migration script...');
    const migrationSQL = readFileSync('enhanced-features-migration.sql', 'utf8');
    
    console.log('\n🔄 Executing migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!');
    
    console.log('\n🔍 Verifying new tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    tablesResult.rows.forEach(row => console.log('  ✓', row.table_name));
    
    console.log('\n🔍 Checking new columns in products table...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Products table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });
    
    console.log('\n🔍 Checking sample data...');
    const outletsResult = await client.query('SELECT * FROM outlets LIMIT 5');
    console.log(`📋 Outlets: ${outletsResult.rows.length} records`);
    
    const discountsResult = await client.query('SELECT * FROM discounts LIMIT 5');
    console.log(`📋 Discounts: ${discountsResult.rows.length} records`);
    
    client.release();
    console.log('\n🎉 Enhanced features migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
  } finally {
    await pool.end();
  }
}

runMigration();
