#!/usr/bin/env node

/**
 * 🔍 SUPABASE CONNECTION TESTER
 * Script untuk test koneksi ke Supabase database
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.supabase' });
dotenv.config({ path: '.env' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSupabaseConnection() {
  colorLog('cyan', '🔍 ===== SUPABASE CONNECTION TEST =====\n');

  // Check environment variables
  colorLog('blue', '1️⃣ Checking environment variables...');
  
  const requiredEnvs = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  let envComplete = true;
  
  requiredEnvs.forEach(env => {
    if (process.env[env]) {
      colorLog('green', `   ✅ ${env}: ${process.env[env].substring(0, 50)}...`);
    } else {
      colorLog('red', `   ❌ ${env}: Not found`);
      envComplete = false;
    }
  });

  if (!envComplete) {
    colorLog('red', '\n❌ Missing required environment variables!');
    colorLog('yellow', '💡 Please check your .env.local file');
    return false;
  }

  // Test PostgreSQL connection
  colorLog('blue', '\n2️⃣ Testing PostgreSQL connection...');
  
  try {
    const pg = await import('pg');
    const { Pool } = pg.default;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    
    colorLog('green', '   ✅ PostgreSQL connection successful!');
    colorLog('blue', `   📅 Server time: ${result.rows[0].current_time}`);
    colorLog('blue', `   🗄️  PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    colorLog('red', '   ❌ PostgreSQL connection failed!');
    colorLog('red', `   Error: ${error.message}`);
    return false;
  }

  // Test Supabase API
  colorLog('blue', '\n3️⃣ Testing Supabase API...');
  
  try {
    const supabaseJs = await import('@supabase/supabase-js');
    const { createClient } = supabaseJs;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      colorLog('yellow', '   ⚠️  Supabase API test completed with note:');
      colorLog('yellow', `   Note: ${error.message}`);
      colorLog('blue', '   💡 This might be normal if RLS policies are strict');
    } else {
      colorLog('green', '   ✅ Supabase API connection successful!');
    }
    
  } catch (error) {
    colorLog('red', '   ❌ Supabase API test failed!');
    colorLog('red', `   Error: ${error.message}`);
    return false;
  }

  // Test database tables
  colorLog('blue', '\n4️⃣ Checking database tables...');
  
  try {
    const pg = await import('pg');
    const { Pool } = pg.default;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    
    // Check if main tables exist
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'products', 'categories', 'transactions')
      ORDER BY table_name
    `);
    
    if (tableCheck.rows.length > 0) {
      colorLog('green', '   ✅ Database tables found:');
      tableCheck.rows.forEach(row => {
        colorLog('green', `      - ${row.table_name}`);
      });
    } else {
      colorLog('yellow', '   ⚠️  No main tables found');
      colorLog('blue', '   💡 You may need to run database migrations');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    colorLog('red', '   ❌ Table check failed!');
    colorLog('red', `   Error: ${error.message}`);
  }

  colorLog('green', '\n🎉 Supabase connection test completed successfully! ✅');
  return true;
}

// Run the test
testSupabaseConnection().catch(error => {
  colorLog('red', `\n❌ Connection test failed: ${error.message}`);
  process.exit(1);
});
