#!/usr/bin/env node

/**
 * POS CafeLux - Simple Supabase Connection Diagnostic
 * This script diagnoses Supabase connection issues without external dependencies
 */

import { Pool } from 'pg';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDNSResolution(hostname) {
  try {
    const result = await lookup(hostname);
    log('green', `✅ DNS Resolution successful: ${hostname} -> ${result.address}`);
    return true;
  } catch (error) {
    log('red', `❌ DNS Resolution failed: ${hostname}`);
    log('yellow', `   Error: ${error.message}`);
    return false;
  }
}

async function testDatabaseConnection(connectionString) {
  try {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 1
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    log('green', '✅ Database connection successful');
    log('cyan', `   Server time: ${result.rows[0].current_time}`);
    log('cyan', `   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    log('red', `❌ Database connection failed: ${error.message}`);
    return false;
  }
}

async function main() {
  log('magenta', '🔍 POS CafeLux - Supabase Connection Diagnostic');
  log('magenta', '===============================================\n');

  // Read current environment
  const currentDatabaseUrl = process.env.DATABASE_URL;
  
  if (!currentDatabaseUrl) {
    log('red', '❌ DATABASE_URL not found in environment variables');
    log('yellow', '\n🔧 To fix this:');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add your Supabase DATABASE_URL:');
    console.log('   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres');
    console.log('3. Replace YOUR_PASSWORD and YOUR_PROJECT_REF with your actual values');
    return;
  }

  log('cyan', `📋 Found DATABASE_URL: ${currentDatabaseUrl.replace(/:[^:@]*@/, ':****@')}`);

  // Extract project info from DATABASE_URL
  const match = currentDatabaseUrl.match(/db\.([^.]+)\.supabase\.co/);
  if (!match) {
    log('red', '❌ Invalid Supabase DATABASE_URL format');
    log('yellow', 'Expected format: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres');
    return;
  }

  const projectRef = match[1];
  log('cyan', `📋 Project reference: ${projectRef}`);

  // Test 1: DNS Resolution
  log('blue', '\n🌐 Testing DNS Resolution...');
  const hostname = `db.${projectRef}.supabase.co`;
  const dnsOk = await testDNSResolution(hostname);

  if (!dnsOk) {
    log('yellow', '\n🔧 DNS Resolution Issues - Possible causes:');
    console.log('1. The Supabase project does not exist or was deleted');
    console.log('2. The project reference in your URL is incorrect');
    console.log('3. Network connectivity issues');
    console.log('4. DNS server problems');
    console.log('\n💡 Solutions:');
    console.log('- Verify your project exists at https://supabase.com/dashboard');
    console.log('- Check the project reference in Settings > API');
    console.log('- Try using a different DNS server (8.8.8.8, 1.1.1.1)');
    return;
  }

  // Test 2: Database Connection
  log('blue', '\n🗄️  Testing Database Connection...');
  const dbOk = await testDatabaseConnection(currentDatabaseUrl);

  if (!dbOk) {
    log('yellow', '\n🔧 Database Connection Issues - Possible causes:');
    console.log('1. Incorrect database password');
    console.log('2. Database is paused or suspended');
    console.log('3. Connection limit reached');
    console.log('4. SSL/TLS configuration issues');
    console.log('\n💡 Solutions:');
    console.log('- Verify your database password in Supabase Settings > Database');
    console.log('- Check if your project is paused (free tier limitation)');
    console.log('- Try the pooler connection string for better reliability');
    console.log('- Ensure your project has not exceeded usage limits');
    return;
  }

  // Test 3: Verify tables exist
  log('blue', '\n📋 Checking Database Schema...');
  try {
    const pool = new Pool({
      connectionString: currentDatabaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'products', 'categories', 'customers', 'transactions')
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      log('yellow', '⚠️  No POS tables found - database migration needed');
      console.log('\n💡 Run the migration:');
      console.log('1. Go to your Supabase dashboard > SQL Editor');
      console.log('2. Copy the content from supabase-migration.sql');
      console.log('3. Paste and run the migration script');
      console.log('4. Or run: npx tsx setup-supabase.js');
    } else {
      log('green', `✅ Found ${tablesResult.rows.length} POS tables:`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      // Check sample data
      const productsResult = await client.query('SELECT COUNT(*) FROM products');
      log('cyan', `   Products: ${productsResult.rows[0].count} records`);
    }

    client.release();
    await pool.end();

  } catch (error) {
    log('red', `❌ Schema check failed: ${error.message}`);
  }

  // Success summary
  log('green', '\n🎉 Supabase connection is working!');
  log('blue', '\n📋 Next steps:');
  console.log('1. If tables are missing, run the migration script');
  console.log('2. Start your application: npm run dev');
  console.log('3. Test the application at http://localhost:5000');
}

// Run the diagnostic
main().catch(console.error);
