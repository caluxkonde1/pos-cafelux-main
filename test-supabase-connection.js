import 'dotenv/config';
import { Pool } from 'pg';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment');
    return;
  }
  
  // Parse the URL to check components
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('📋 Connection details:');
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   Username: ${url.username}`);
    console.log(`   SSL: ${url.searchParams.get('sslmode') || 'default'}`);
  } catch (error) {
    console.log('❌ Invalid DATABASE_URL format:', error.message);
    return;
  }
  
  // Test basic connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1
  });
  
  try {
    console.log('🔗 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result.rows[0].current_time);
    
    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tables found:', tablesResult.rows.length);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    client.release();
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 DNS Resolution Issue:');
      console.log('   - Check if the Supabase project URL is correct');
      console.log('   - Verify your internet connection');
      console.log('   - Try accessing the Supabase dashboard to confirm the project exists');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection Refused:');
      console.log('   - Check if the database is running');
      console.log('   - Verify the port number');
    } else if (error.message.includes('password')) {
      console.log('\n🔧 Authentication Issue:');
      console.log('   - Check if the password is correct');
      console.log('   - Verify the username');
    }
  } finally {
    await pool.end();
  }
}

testSupabaseConnection().catch(console.error);
