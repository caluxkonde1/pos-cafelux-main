#!/usr/bin/env node

/**
 * 🚀 POS CafeLux - Start with Supabase
 * Script untuk menjalankan aplikasi dengan koneksi Supabase
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
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

function checkEnvironmentVariables() {
  colorLog('cyan', '🔍 Checking environment variables...\n');
  
  const requiredEnvs = [
    'DATABASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
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
    colorLog('yellow', '💡 Please check your .env file or copy from .env.example');
    colorLog('blue', '📝 Required variables:');
    requiredEnvs.forEach(env => {
      colorLog('blue', `   - ${env}`);
    });
    process.exit(1);
  }

  colorLog('green', '\n✅ All environment variables are set!');
  return true;
}

function startApplication() {
  colorLog('cyan', '\n🚀 Starting POS CafeLux with Supabase...\n');
  
  // Set environment variables for the application
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    SKIP_DATABASE: 'false',
    USE_MOCK_DATA: 'false'
  };

  // Start the development server
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: env,
    shell: true
  });

  server.on('error', (error) => {
    colorLog('red', `❌ Failed to start server: ${error.message}`);
    process.exit(1);
  });

  server.on('close', (code) => {
    if (code !== 0) {
      colorLog('red', `❌ Server exited with code ${code}`);
      process.exit(code);
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    colorLog('yellow', '\n⏹️  Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    colorLog('yellow', '\n⏹️  Shutting down server...');
    server.kill('SIGTERM');
    process.exit(0);
  });
}

function main() {
  colorLog('cyan', '🏪 ===== POS CafeLux - Supabase Setup =====\n');
  
  try {
    // Check if .env file exists
    if (!fs.existsSync('.env') && !fs.existsSync('.env.local')) {
      colorLog('yellow', '⚠️  No .env file found!');
      colorLog('blue', '📝 Please create .env file from .env.example');
      colorLog('blue', '   cp .env.example .env');
      process.exit(1);
    }

    // Check environment variables
    checkEnvironmentVariables();
    
    // Start the application
    startApplication();
    
  } catch (error) {
    colorLog('red', `❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
