import { Pool } from 'pg';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

async function testIPv4Connection() {
  const hostname = 'db.wbseybltsgfstwqqnzxg.supabase.co';
  const connectionString = 'postgresql://postgres:Caluxkonde87253186@db.wbseybltsgfstwqqnzxg.supabase.co:5432/postgres';
  
  console.log('🔍 Testing IPv4 connection to Supabase...');
  
  try {
    // Try to resolve IPv4 address specifically
    console.log('📋 Resolving IPv4 address...');
    const { address } = await lookup(hostname, { family: 4 });
    console.log(`✅ IPv4 address found: ${address}`);
    
    // Create connection string with IP address
    const ipConnectionString = connectionString.replace(hostname, address);
    console.log(`🔗 Connecting to IP: ${address}`);
    
    const pool = new Pool({
      connectionString: ipConnectionString,
      ssl: {
        rejectUnauthorized: false,
        servername: hostname // Important: keep original hostname for SSL
      },
      connectionTimeoutMillis: 10000,
      max: 1
    });
    
    const client = await pool.connect();
    console.log('✅ IPv4 connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 IPv4 connection works! The issue was IPv6 compatibility.');
    console.log('\n💡 Solution: Update your .env file with:');
    console.log(`DATABASE_URL="${ipConnectionString}"`);
    
  } catch (ipv4Error) {
    console.log('❌ IPv4 connection also failed:', ipv4Error.message);
    
    // Try alternative approaches
    console.log('\n🔄 Trying alternative connection methods...');
    
    // Method 1: Force IPv4 in Node.js
    const originalLookup = dns.lookup;
    dns.lookup = (hostname, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options = { ...options, family: 4 };
      return originalLookup(hostname, options, callback);
    };
    
    try {
      console.log('📋 Method 1: Forcing IPv4 in DNS lookup...');
      const pool2 = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
        max: 1
      });
      
      const client2 = await pool2.connect();
      console.log('✅ Method 1 successful!');
      client2.release();
      await pool2.end();
      
      console.log('\n💡 Solution: The connection works with forced IPv4.');
      console.log('Add this to your server startup code to force IPv4.');
      
    } catch (method1Error) {
      console.log('❌ Method 1 failed:', method1Error.message);
      
      // Restore original lookup
      dns.lookup = originalLookup;
      
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if your network blocks IPv6 connections');
      console.log('2. Try connecting from a different network');
      console.log('3. Contact Supabase support about IPv6 connectivity');
      console.log('4. Use Supabase connection pooler (different hostname)');
    }
  }
}

testIPv4Connection().catch(console.error);
