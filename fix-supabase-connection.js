#!/usr/bin/env node

/**
 * POS CafeLux - Supabase Connection Diagnostic and Fix Script
 * This script diagnoses and fixes common Supabase connection issues
 */

import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
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

async function testSupabaseAPI(url, key) {
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('_health_check').select('*').limit(1);
    
    // Even if table doesn't exist, API connection is working if we get a proper error response
    if (error && (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist'))) {
      log('green', '✅ Supabase API connection successful');
      return true;
    } else if (error) {
      throw error;
    }
    
    log('green', '✅ Supabase API connection successful');
    return true;
  } catch (error) {
    log('red', `❌ Supabase API connection failed: ${error.message}`);
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

async function checkSupabaseProject(projectRef) {
  const hosts = [
    `db.${projectRef}.supabase.co`,
    `${projectRef}.supabase.co`,
    `api.${projectRef}.supabase.co`
  ];

  log('blue', '\n🔍 Testing Supabase project endpoints...');
  
  for (const host of hosts) {
    await testDNSResolution(host);
  }
}

async function suggestFixes(issues) {
  log('yellow', '\n🔧 Suggested Fixes:');
  
  if (issues.includes('dns')) {
    log('yellow', '\n📡 DNS Resolution Issues:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify the Supabase project URL is correct');
    console.log('   3. Ensure the Supabase project exists and is active');
    console.log('   4. Try using a different DNS server (8.8.8.8, 1.1.1.1)');
    console.log('   5. Check if your firewall is blocking the connection');
  }
  
  if (issues.includes('api')) {
    log('yellow', '\n🔑 API Connection Issues:');
    console.log('   1. Verify your Supabase URL is correct');
    console.log('   2. Check your Anon Key is valid and not expired');
    console.log('   3. Ensure the project is not paused or deleted');
    console.log('   4. Check Supabase service status at status.supabase.com');
  }
  
  if (issues.includes('database')) {
    log('yellow', '\n🗄️  Database Connection Issues:');
    console.log('   1. Verify your database password is correct');
    console.log('   2. Check if the database URL format is correct');
    console.log('   3. Ensure your IP is allowed (Supabase allows all by default)');
    console.log('   4. Try connecting with pooler connection string');
    console.log('   5. Check if the database is paused or has reached limits');
  }
}

async function generateNewEnvTemplate() {
  log('blue', '\n📝 Environment Template:');
  console.log(`
# Copy this template to your .env file and fill in your actual values

# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (Direct Connection)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Alternative: Pooler Connection (for high traffic)
# DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Application Configuration
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-secret-key-here

# Features
ENABLE_SUPABASE=true
ENABLE_REALTIME=true
`);
}

async function main() {
  log('magenta', '🔍 POS CafeLux - Supabase Connection Diagnostic');
  log('magenta', '===============================================\n');

  const issues = [];

  // Read current environment
  let currentConfig = {};
  try {
    // Try to read from process.env (if .env is loaded)
    currentConfig = {
      DATABASE_URL: process.env.DATABASE_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    };
  } catch (error) {
    log('yellow', '⚠️  Could not read current environment configuration');
  }

  // Extract project info from DATABASE_URL if available
  let projectRef = null;
  if (currentConfig.DATABASE_URL) {
    const match = currentConfig.DATABASE_URL.match(/db\.([^.]+)\.supabase\.co/);
    if (match) {
      projectRef = match[1];
      log('cyan', `📋 Detected project reference: ${projectRef}`);
    }
  }

  // Test 1: DNS Resolution
  if (projectRef) {
    log('blue', '\n🌐 Testing DNS Resolution...');
    const dnsOk = await checkSupabaseProject(projectRef);
    if (!dnsOk) {
      issues.push('dns');
    }
  } else {
    log('yellow', '⚠️  No project reference found in DATABASE_URL');
    issues.push('dns');
  }

  // Test 2: Supabase API
  if (currentConfig.SUPABASE_URL && currentConfig.SUPABASE_ANON_KEY) {
    log('blue', '\n🔑 Testing Supabase API...');
    const apiOk = await testSupabaseAPI(currentConfig.SUPABASE_URL, currentConfig.SUPABASE_ANON_KEY);
    if (!apiOk) {
      issues.push('api');
    }
  } else {
    log('yellow', '⚠️  Supabase API credentials not found');
    issues.push('api');
  }

  // Test 3: Database Connection
  if (currentConfig.DATABASE_URL) {
    log('blue', '\n🗄️  Testing Database Connection...');
    const dbOk = await testDatabaseConnection(currentConfig.DATABASE_URL);
    if (!dbOk) {
      issues.push('database');
    }
  } else {
    log('yellow', '⚠️  DATABASE_URL not found');
    issues.push('database');
  }

  // Summary
  log('blue', '\n📊 Diagnostic Summary:');
  if (issues.length === 0) {
    log('green', '🎉 All connections are working properly!');
    log('green', 'Your Supabase setup is ready to use.');
  } else {
    log('red', `❌ Found ${issues.length} issue(s): ${issues.join(', ')}`);
    await suggestFixes(issues);
  }

  // Always show template
  await generateNewEnvTemplate();

  log('blue', '\n📋 Next Steps:');
  console.log('1. If you need to create a new Supabase project:');
  console.log('   - Go to https://supabase.com');
  console.log('   - Create a new project');
  console.log('   - Get your credentials from Settings > API');
  console.log('');
  console.log('2. Run the setup wizard:');
  console.log('   npx tsx setup-supabase.js');
  console.log('');
  console.log('3. Or manually update your .env file with correct values');
}

// Run the diagnostic
main().catch(console.error);
