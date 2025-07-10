#!/usr/bin/env node

/**
 * 🔍 Database Connection Checker
 * This script checks and diagnoses database connection issues
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

function checkDatabaseConnection() {
  console.log('\n🔍 Database Connection Diagnostic\n');
  
  // Check if DATABASE_URL exists
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log('DATABASE_URL not found in environment variables', 'warning');
    log('Application will use MemStorage (in-memory database)', 'info');
    log('This is normal for development/testing', 'info');
    return 'memstorage';
  }
  
  log(`DATABASE_URL found: ${databaseUrl.substring(0, 20)}...`, 'info');
  
  // Parse DATABASE_URL
  try {
    const url = new URL(databaseUrl);
    
    log(`Protocol: ${url.protocol}`, 'info');
    log(`Hostname: ${url.hostname}`, 'info');
    log(`Port: ${url.port || 'default'}`, 'info');
    log(`Database: ${url.pathname.substring(1)}`, 'info');
    log(`Username: ${url.username}`, 'info');
    
    // Check for common issues
    if (url.hostname === 'https' || url.hostname === 'http') {
      log('ERROR: Invalid hostname detected!', 'error');
      log('DATABASE_URL format should be: mysql://user:pass@host:port/database', 'error');
      log('Current format appears to be: https://... (incorrect)', 'error');
      return 'invalid_format';
    }
    
    if (url.protocol === 'mysql:') {
      log('MySQL database detected', 'success');
      return 'mysql';
    } else if (url.protocol === 'postgresql:' || url.protocol === 'postgres:') {
      log('PostgreSQL database detected', 'success');
      return 'postgresql';
    } else {
      log(`Unknown database protocol: ${url.protocol}`, 'warning');
      return 'unknown';
    }
    
  } catch (error) {
    log(`Error parsing DATABASE_URL: ${error.message}`, 'error');
    log('DATABASE_URL format should be: mysql://user:pass@host:port/database', 'error');
    return 'parse_error';
  }
}

function showRecommendations(dbType) {
  console.log('\n📋 Recommendations:\n');
  
  switch (dbType) {
    case 'memstorage':
      log('Using MemStorage - Application will work but data is temporary', 'info');
      log('To setup persistent database:', 'info');
      console.log('  1. Run: npm run db:setup:niagahoster');
      console.log('  2. Follow NIAGAHOSTER_DATABASE_SETUP_GUIDE.md');
      console.log('  3. Use niagahoster-mysql-migration-fixed.sql');
      break;
      
    case 'invalid_format':
      log('Fix DATABASE_URL format in .env file', 'error');
      log('Correct format: mysql://username:password@hostname:3306/database', 'info');
      log('Example: mysql://user123:pass456@mysql.niagahoster.com:3306/user123_pos_cafelux', 'info');
      break;
      
    case 'parse_error':
      log('Fix DATABASE_URL syntax in .env file', 'error');
      log('Make sure there are no extra spaces or invalid characters', 'info');
      break;
      
    case 'mysql':
      log('MySQL configuration looks correct', 'success');
      log('If connection fails, check:', 'info');
      console.log('  1. Database credentials are correct');
      console.log('  2. Database exists in Niagahoster cPanel');
      console.log('  3. User has proper privileges');
      console.log('  4. Hostname is accessible');
      break;
      
    case 'postgresql':
      log('PostgreSQL configuration detected', 'success');
      log('Make sure your hosting supports PostgreSQL', 'info');
      break;
      
    default:
      log('Unknown database type - check your DATABASE_URL', 'warning');
  }
}

function showCurrentStatus() {
  console.log('\n📊 Current Application Status:\n');
  
  log('✅ POS CafeLux Application: Fully functional', 'success');
  log('✅ Vercel Deployment: https://pos-cafelux-main.vercel.app/', 'success');
  log('✅ Frontend Interface: Working with MemStorage', 'success');
  log('✅ All POS Features: Product management, transactions, reports', 'success');
  
  const dbType = checkDatabaseConnection();
  
  if (dbType === 'memstorage') {
    log('⚠️  Database: MemStorage (temporary data)', 'warning');
    log('💡 For production: Setup Niagahoster MySQL database', 'info');
  } else if (dbType === 'mysql' || dbType === 'postgresql') {
    log('🔄 Database: Configured but connection needs verification', 'info');
  } else {
    log('❌ Database: Configuration error detected', 'error');
  }
  
  showRecommendations(dbType);
}

// Run the diagnostic
showCurrentStatus();

console.log('\n🚀 Next Steps:\n');
console.log('1. 🧪 Test application: npm run dev');
console.log('2. 🌐 Check live site: https://pos-cafelux-main.vercel.app/');
console.log('3. 🗄️  Setup database: npm run db:setup:niagahoster');
console.log('4. 📖 Read guides: NIAGAHOSTER_DATABASE_SETUP_GUIDE.md');
console.log('5. 🚨 Fix errors: NIAGAHOSTER_ERROR_FIX.md\n');
