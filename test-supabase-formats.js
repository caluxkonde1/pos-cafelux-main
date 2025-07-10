import 'dotenv/config';
import { Pool } from 'pg';

async function testDifferentFormats() {
  const projectRef = 'wbseybltsgfstwqqnzxg';
  const password = process.env.DATABASE_URL?.match(/postgres:\/\/postgres:([^@]+)@/)?.[1];
  
  if (!password) {
    console.log('❌ Could not extract password from DATABASE_URL');
    return;
  }
  
  const formats = [
    `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${password}@${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres:${password}@db.${projectRef}.supabase.co:6543/postgres`,
  ];
  
  console.log('🔍 Testing different Supabase connection formats...\n');
  
  for (let i = 0; i < formats.length; i++) {
    const url = formats[i];
    const hostname = new URL(url).hostname;
    
    console.log(`📋 Test ${i + 1}: ${hostname}`);
    
    const pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      max: 1
    });
    
    try {
      const client = await pool.connect();
      console.log('✅ Connection successful!');
      
      const result = await client.query('SELECT version()');
      console.log('✅ Database version:', result.rows[0].version.split(' ')[0]);
      
      client.release();
      await pool.end();
      
      console.log(`\n🎉 Working connection string format found!`);
      console.log(`Use this in your .env file:`);
      console.log(`DATABASE_URL="${url}"`);
      return;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      await pool.end();
    }
    
    console.log('');
  }
  
  console.log('❌ None of the connection formats worked.');
  console.log('\n🔧 Please check:');
  console.log('1. Go to Supabase Dashboard → Settings → Database');
  console.log('2. Copy the exact "Connection string" under "Connection parameters"');
  console.log('3. Make sure to use the "URI" format, not the individual parameters');
}

testDifferentFormats().catch(console.error);
