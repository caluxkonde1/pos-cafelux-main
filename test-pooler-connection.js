import { Pool } from 'pg';

async function testPoolerConnection() {
  console.log('🔍 Testing Supabase connection pooler...');
  
  // Supabase often provides connection pooler endpoints
  const poolerUrls = [
    'postgresql://postgres:Caluxkonde87253186@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres:Caluxkonde87253186@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres:Caluxkonde87253186@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres:Caluxkonde87253186@aws-0-us-west-1.pooler.supabase.com:5432/postgres'
  ];
  
  for (let i = 0; i < poolerUrls.length; i++) {
    const url = poolerUrls[i];
    const hostname = new URL(url).hostname;
    
    console.log(`\n📋 Test ${i + 1}: ${hostname}`);
    
    const pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
      max: 1
    });
    
    try {
      console.log('🔗 Attempting connection...');
      const client = await pool.connect();
      console.log('✅ Connection successful!');
      
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Query successful:', result.rows[0].current_time);
      
      client.release();
      await pool.end();
      
      console.log(`\n🎉 Working pooler connection found!`);
      console.log(`💡 Update your .env file with:`);
      console.log(`DATABASE_URL="${url}"`);
      return;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      await pool.end();
    }
  }
  
  console.log('\n❌ All pooler connections failed.');
  console.log('\n🔧 Alternative solutions:');
  console.log('1. **Use Supabase REST API** instead of direct database connection');
  console.log('2. **Check Supabase project status** - it might be paused or suspended');
  console.log('3. **Try from different network** - your ISP might be blocking connections');
  console.log('4. **Use Supabase Edge Functions** for database operations');
  console.log('5. **Contact Supabase support** about connectivity issues');
  
  console.log('\n📋 For now, let\'s continue with MemStorage and test the app functionality...');
}

testPoolerConnection().catch(console.error);
