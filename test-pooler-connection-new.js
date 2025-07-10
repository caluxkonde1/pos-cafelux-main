import { Pool } from 'pg';

const connectionString = 'postgresql://postgres.wbseybltsgfstwqqnzxg:Caluxkonde87253186@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🔍 Testing Supabase Pooler Connection...');
console.log('Connection String:', connectionString);

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('\n📡 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    console.log('\n🔍 Testing basic query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Query successful!');
    console.log('PostgreSQL Version:', result.rows[0].version);
    
    console.log('\n📋 Testing table listing...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ Tables found:', tables.rows.length);
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    client.release();
    console.log('\n🎉 All tests passed! Supabase connection is working.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
  } finally {
    await pool.end();
  }
}

testConnection();
