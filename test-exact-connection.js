import { Pool } from 'pg';

async function testExactConnection() {
  const connectionString = 'postgresql://postgres:Caluxkonde87253186@db.wbseybltsgfstwqqnzxg.supabase.co:5432/postgres';
  
  console.log('🔍 Testing exact Supabase connection...');
  console.log('📋 Host: db.wbseybltsgfstwqqnzxg.supabase.co');
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    max: 1
  });
  
  try {
    console.log('🔗 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('✅ Query test successful!');
    console.log('   Current time:', result.rows[0].current_time);
    console.log('   Database:', result.rows[0].version.split(' ')[0]);
    
    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables found:', tablesResult.rows.length);
    if (tablesResult.rows.length > 0) {
      console.log('   Tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   No tables found - migration may be needed');
    }
    
    // Test if we can query users table
    try {
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Users table: ${usersResult.rows[0].count} records`);
    } catch (error) {
      console.log('\n👥 Users table: Not accessible or doesn\'t exist');
    }
    
    client.release();
    console.log('\n🎉 Supabase connection is working perfectly!');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Error code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 DNS Resolution Issue - the hostname cannot be found');
      console.log('This might be a network connectivity issue or the project might not exist');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection Refused - the server is not accepting connections');
    } else if (error.message.includes('password')) {
      console.log('\n🔧 Authentication Issue - check username/password');
    }
  } finally {
    await pool.end();
  }
}

testExactConnection().catch(console.error);
