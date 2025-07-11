#!/usr/bin/env node

/**
 * 🔧 FIX DATABASE URL
 * Script untuk memperbaiki DATABASE_URL dengan format yang benar
 */

import fs from 'fs';
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

async function fixDatabaseUrl() {
  console.clear();
  colorLog('cyan', '🔧 ===== FIX DATABASE URL =====\n');

  // Get current values
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const currentDatabaseUrl = process.env.DATABASE_URL;
  
  if (!supabaseUrl) {
    colorLog('red', '❌ NEXT_PUBLIC_SUPABASE_URL not found!');
    return;
  }

  // Extract project reference
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    colorLog('red', '❌ Could not extract project reference from SUPABASE_URL!');
    return;
  }

  colorLog('blue', `🆔 Project Reference: ${projectRef}`);
  colorLog('blue', `🌐 Supabase URL: ${supabaseUrl}`);

  // Extract password from current DATABASE_URL
  let password = '';
  if (currentDatabaseUrl) {
    try {
      const url = new URL(currentDatabaseUrl);
      password = url.password;
      colorLog('blue', `🔐 Current Password: ${password ? '[FOUND]' : '[NOT FOUND]'}`);
    } catch (error) {
      colorLog('yellow', '⚠️  Could not parse current DATABASE_URL');
    }
  }

  // Generate correct DATABASE_URLs
  const directConnectionUrl = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
  const poolerConnectionUrl = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

  colorLog('green', '\n✅ CORRECT DATABASE_URL OPTIONS:');
  colorLog('blue', '\n📋 Option 1 - Direct Connection:');
  colorLog('cyan', directConnectionUrl);
  
  colorLog('blue', '\n📋 Option 2 - Pooler Connection (Recommended):');
  colorLog('cyan', poolerConnectionUrl);

  // Update .env.local file
  colorLog('yellow', '\n🔄 Updating .env.local file...');
  
  try {
    let envContent = '';
    if (fs.existsSync('.env.local')) {
      envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Replace or add DATABASE_URL
    const newDatabaseUrl = poolerConnectionUrl; // Use pooler by default
    
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*$/m, `DATABASE_URL=${newDatabaseUrl}`);
    } else {
      envContent += `\nDATABASE_URL=${newDatabaseUrl}\n`;
    }

    fs.writeFileSync('.env.local', envContent);
    colorLog('green', '   ✅ .env.local updated with pooler connection');
    
  } catch (error) {
    colorLog('red', '   ❌ Failed to update .env.local');
    colorLog('red', `   Error: ${error.message}`);
  }

  // Update .env.supabase file
  colorLog('yellow', '\n🔄 Updating .env.supabase file...');
  
  try {
    let envContent = '';
    if (fs.existsSync('.env.supabase')) {
      envContent = fs.readFileSync('.env.supabase', 'utf8');
    }

    // Replace or add DATABASE_URL
    const newDatabaseUrl = poolerConnectionUrl;
    
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*$/m, `DATABASE_URL=${newDatabaseUrl}`);
    } else {
      envContent += `\nDATABASE_URL=${newDatabaseUrl}\n`;
    }

    fs.writeFileSync('.env.supabase', envContent);
    colorLog('green', '   ✅ .env.supabase updated with pooler connection');
    
  } catch (error) {
    colorLog('red', '   ❌ Failed to update .env.supabase');
    colorLog('red', `   Error: ${error.message}`);
  }

  // Create updated production template
  colorLog('yellow', '\n🔄 Updating production template...');
  
  const prodTemplate = `# 🚀 PRODUCTION ENVIRONMENT VARIABLES FOR VERCEL
# Copy these to your Vercel dashboard > Settings > Environment Variables

# ===== SUPABASE CONFIGURATION =====
DATABASE_URL=${poolerConnectionUrl}
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY_FROM_SUPABASE_DASHBOARD]

# ===== APPLICATION CONFIGURATION =====
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pos-cafelux-main.vercel.app
SESSION_SECRET=pos_cafelux_2024_secure_session_key_12345
JWT_SECRET=pos_cafelux_2024_jwt_secret_key_67890

# ===== OPTIONAL CONFIGURATIONS =====
NEXT_PUBLIC_STORAGE_BUCKET=pos-cafelux-storage
`;

  fs.writeFileSync('.env.production.template', prodTemplate);
  colorLog('green', '   ✅ .env.production.template updated');

  // Summary
  colorLog('cyan', '\n🎯 ===== SUMMARY =====');
  colorLog('green', '✅ DATABASE_URL fixed with correct project reference');
  colorLog('green', '✅ Using pooler connection for better performance');
  colorLog('green', '✅ Environment files updated');
  colorLog('green', '✅ Production template updated');

  colorLog('magenta', '\n📋 ===== NEXT STEPS =====');
  colorLog('blue', '1. Test connection: node test-supabase-connection.js');
  colorLog('blue', '2. If successful, start dev server: npm run dev');
  colorLog('blue', '3. Update Vercel environment variables');
  colorLog('blue', '4. Deploy to production');

  colorLog('yellow', '\n⚠️  IMPORTANT NOTES:');
  colorLog('blue', '• Pooler connection is recommended for production');
  colorLog('blue', '• Make sure password is correct in DATABASE_URL');
  colorLog('blue', '• Update Vercel env vars with new DATABASE_URL');
  colorLog('blue', '• Restart dev server after env changes');
}

// Run the fix
fixDatabaseUrl().catch(error => {
  colorLog('red', `\n❌ Fix failed: ${error.message}`);
  process.exit(1);
});
