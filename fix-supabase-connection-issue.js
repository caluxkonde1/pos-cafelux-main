#!/usr/bin/env node

/**
 * 🔧 FIX SUPABASE CONNECTION ISSUE
 * Script untuk mendiagnosis dan memperbaiki masalah koneksi Supabase
 */

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

async function diagnoseSupabaseConnection() {
  console.clear();
  colorLog('cyan', '🔧 ===== SUPABASE CONNECTION DIAGNOSIS =====\n');

  // Step 1: Analyze DATABASE_URL
  colorLog('blue', '1️⃣ Analyzing DATABASE_URL...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    colorLog('red', '   ❌ DATABASE_URL not found!');
    return;
  }

  try {
    const url = new URL(databaseUrl);
    colorLog('green', '   ✅ DATABASE_URL format valid');
    colorLog('blue', `   🔗 Protocol: ${url.protocol}`);
    colorLog('blue', `   🏠 Host: ${url.hostname}`);
    colorLog('blue', `   🔌 Port: ${url.port || '5432'}`);
    colorLog('blue', `   👤 Username: ${url.username}`);
    colorLog('blue', `   🔐 Password: ${url.password ? '[HIDDEN]' : 'NOT SET'}`);
    colorLog('blue', `   🗄️  Database: ${url.pathname.slice(1)}`);
    
    // Check if it's the correct Supabase format
    if (url.hostname.includes('supabase.co')) {
      colorLog('green', '   ✅ Supabase hostname detected');
    } else {
      colorLog('yellow', '   ⚠️  Non-Supabase hostname detected');
    }
    
  } catch (error) {
    colorLog('red', '   ❌ Invalid DATABASE_URL format!');
    colorLog('red', `   Error: ${error.message}`);
    return;
  }

  // Step 2: Check Supabase API credentials
  colorLog('blue', '\n2️⃣ Checking Supabase API credentials...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && anonKey) {
    colorLog('green', '   ✅ Supabase API credentials present');
    
    // Extract project ref from URL
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      colorLog('blue', `   🆔 Project Reference: ${projectRef}`);
      
      // Check if DATABASE_URL matches project ref
      if (databaseUrl.includes(projectRef)) {
        colorLog('green', '   ✅ DATABASE_URL matches project reference');
      } else {
        colorLog('red', '   ❌ DATABASE_URL does not match project reference!');
        colorLog('yellow', '   💡 This might be the cause of "Tenant or user not found" error');
      }
    }
  } else {
    colorLog('red', '   ❌ Missing Supabase API credentials');
  }

  // Step 3: Test Supabase API connection (without database)
  colorLog('blue', '\n3️⃣ Testing Supabase API connection...');
  
  try {
    const supabaseJs = await import('@supabase/supabase-js');
    const { createClient } = supabaseJs;
    const supabase = createClient(supabaseUrl, anonKey);

    // Simple API test
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== 'Auth session missing!') {
      colorLog('red', '   ❌ Supabase API connection failed!');
      colorLog('red', `   Error: ${error.message}`);
    } else {
      colorLog('green', '   ✅ Supabase API connection successful!');
    }
    
  } catch (error) {
    colorLog('red', '   ❌ Supabase API test failed!');
    colorLog('red', `   Error: ${error.message}`);
  }

  // Step 4: Provide solutions
  colorLog('cyan', '\n🔧 ===== RECOMMENDED SOLUTIONS =====');
  
  colorLog('yellow', '📋 SOLUTION 1: Update DATABASE_URL');
  colorLog('blue', '   1. Go to Supabase Dashboard > Settings > Database');
  colorLog('blue', '   2. Copy the correct Connection String');
  colorLog('blue', '   3. Update DATABASE_URL in your .env files');
  colorLog('blue', '   4. Make sure it matches your project reference');

  colorLog('yellow', '\n📋 SOLUTION 2: Check Supabase Project Status');
  colorLog('blue', '   1. Go to Supabase Dashboard');
  colorLog('blue', '   2. Check if project is active and not paused');
  colorLog('blue', '   3. Verify database is running');

  colorLog('yellow', '\n📋 SOLUTION 3: Use Pooler Connection');
  colorLog('blue', '   1. In Supabase Dashboard > Settings > Database');
  colorLog('blue', '   2. Use "Connection pooling" URL instead of direct connection');
  colorLog('blue', '   3. Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');

  colorLog('yellow', '\n📋 SOLUTION 4: Verify Environment Variables');
  colorLog('blue', '   1. Check .env.local has correct values');
  colorLog('blue', '   2. Check .env.supabase has correct values');
  colorLog('blue', '   3. Restart development server after changes');

  // Step 5: Generate correct DATABASE_URL template
  colorLog('cyan', '\n🔗 ===== CORRECT DATABASE_URL TEMPLATE =====');
  
  if (supabaseUrl) {
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      colorLog('green', 'Based on your SUPABASE_URL, your DATABASE_URL should be:');
      colorLog('blue', `postgresql://postgres:[YOUR_PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`);
      colorLog('yellow', '\nOr using connection pooling:');
      colorLog('blue', `postgresql://postgres.${projectRef}:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`);
    }
  }

  colorLog('magenta', '\n🎯 NEXT STEPS:');
  colorLog('blue', '1. Fix DATABASE_URL with correct credentials');
  colorLog('blue', '2. Run: node test-supabase-connection.js');
  colorLog('blue', '3. If still failing, try pooler connection');
  colorLog('blue', '4. Check Supabase project status');
}

// Run diagnosis
diagnoseSupabaseConnection().catch(error => {
  colorLog('red', `\n❌ Diagnosis failed: ${error.message}`);
  process.exit(1);
});
