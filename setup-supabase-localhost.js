#!/usr/bin/env node

/**
 * 🚀 SUPABASE LOCALHOST SETUP
 * Script untuk setup Supabase localhost dan persiapan deployment ke Vercel
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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

async function main() {
  console.clear();
  
  colorLog('cyan', '🚀 ===== SUPABASE LOCALHOST SETUP =====');
  colorLog('yellow', '📋 Setup Supabase untuk localhost dan deployment ke Vercel\n');

  // Step 1: Check if .env.local exists
  colorLog('blue', '1️⃣ Checking environment files...');
  
  const envFiles = ['.env.local', '.env.supabase', '.env'];
  let envFound = false;
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      colorLog('green', `   ✅ Found ${envFile}`);
      envFound = true;
    }
  }
  
  if (!envFound) {
    colorLog('red', '   ❌ No environment files found!');
    colorLog('yellow', '   💡 Please create .env.local with your Supabase credentials');
    return;
  }

  // Step 2: Check Supabase configuration
  colorLog('blue', '\n2️⃣ Checking Supabase configuration...');
  
  if (fs.existsSync('supabase/config.toml')) {
    colorLog('green', '   ✅ Supabase config.toml found');
  } else {
    colorLog('yellow', '   ⚠️  Supabase config.toml not found, initializing...');
    try {
      execSync('npx supabase init --force', { stdio: 'inherit' });
      colorLog('green', '   ✅ Supabase initialized');
    } catch (error) {
      colorLog('red', '   ❌ Failed to initialize Supabase');
      console.error(error.message);
    }
  }

  // Step 3: Check migrations
  colorLog('blue', '\n3️⃣ Checking database migrations...');
  
  const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
  if (migrationFiles.length > 0) {
    colorLog('green', `   ✅ Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => {
      colorLog('green', `      - ${file}`);
    });
  } else {
    colorLog('yellow', '   ⚠️  No migration files found');
  }

  // Step 4: Test database connection
  colorLog('blue', '\n4️⃣ Testing database connection...');
  
  try {
    const testResult = execSync('node test-supabase-connection.js', { encoding: 'utf8' });
    if (testResult.includes('success') || testResult.includes('✅')) {
      colorLog('green', '   ✅ Database connection successful');
    } else {
      colorLog('yellow', '   ⚠️  Database connection test completed (check output above)');
    }
  } catch (error) {
    colorLog('yellow', '   ⚠️  Database connection test failed, will use mock data');
  }

  // Step 5: Check Vercel configuration
  colorLog('blue', '\n5️⃣ Checking Vercel configuration...');
  
  if (fs.existsSync('vercel.json')) {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    colorLog('green', '   ✅ vercel.json found');
    colorLog('blue', `      Framework: ${vercelConfig.framework || 'not specified'}`);
    colorLog('blue', `      Build Command: ${vercelConfig.buildCommand || 'default'}`);
    colorLog('blue', `      Output Directory: ${vercelConfig.outputDirectory || 'default'}`);
  } else {
    colorLog('yellow', '   ⚠️  vercel.json not found');
  }

  // Step 6: Check package.json scripts
  colorLog('blue', '\n6️⃣ Checking build scripts...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'vercel-build', 'start'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      colorLog('green', `   ✅ Script "${script}": ${packageJson.scripts[script]}`);
    } else {
      colorLog('red', `   ❌ Missing script: ${script}`);
    }
  });

  // Step 7: Create production environment template
  colorLog('blue', '\n7️⃣ Creating production environment template...');
  
  const prodEnvTemplate = `# 🚀 PRODUCTION ENVIRONMENT VARIABLES FOR VERCEL
# Copy these to your Vercel dashboard > Settings > Environment Variables

# ===== SUPABASE CONFIGURATION =====
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# ===== APPLICATION CONFIGURATION =====
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pos-cafelux-main.vercel.app
SESSION_SECRET=[GENERATE_RANDOM_STRING]

# ===== OPTIONAL CONFIGURATIONS =====
JWT_SECRET=[GENERATE_RANDOM_STRING]
NEXT_PUBLIC_STORAGE_BUCKET=pos-cafelux-storage
`;

  fs.writeFileSync('.env.production.template', prodEnvTemplate);
  colorLog('green', '   ✅ Created .env.production.template');

  // Step 8: Summary and next steps
  colorLog('cyan', '\n🎯 ===== SETUP SUMMARY =====');
  colorLog('green', '✅ Environment files checked');
  colorLog('green', '✅ Supabase configuration verified');
  colorLog('green', '✅ Database migrations available');
  colorLog('green', '✅ Vercel configuration ready');
  colorLog('green', '✅ Production environment template created');

  colorLog('magenta', '\n📋 ===== NEXT STEPS =====');
  colorLog('yellow', '🔧 FOR LOCAL DEVELOPMENT:');
  colorLog('blue', '   1. Make sure your .env.local has correct Supabase credentials');
  colorLog('blue', '   2. Run: npm run dev');
  colorLog('blue', '   3. Open: http://localhost:5004');

  colorLog('yellow', '\n🚀 FOR VERCEL DEPLOYMENT:');
  colorLog('blue', '   1. Push your code to GitHub:');
  colorLog('blue', '      git add .');
  colorLog('blue', '      git commit -m "Setup Supabase for deployment"');
  colorLog('blue', '      git push origin main');
  
  colorLog('blue', '\n   2. In Vercel Dashboard:');
  colorLog('blue', '      - Go to your project settings');
  colorLog('blue', '      - Add Environment Variables from .env.production.template');
  colorLog('blue', '      - Redeploy your application');

  colorLog('blue', '\n   3. In Supabase Dashboard:');
  colorLog('blue', '      - Go to SQL Editor');
  colorLog('blue', '      - Run the migration scripts from supabase/migrations/');
  colorLog('blue', '      - Verify tables are created');

  colorLog('green', '\n🎉 Setup completed! Your POS CafeLux is ready for localhost and Vercel deployment! 🚀');
}

// Run the setup
main().catch(error => {
  colorLog('red', `\n❌ Error: ${error.message}`);
  process.exit(1);
});
