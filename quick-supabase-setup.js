#!/usr/bin/env node

/**
 * 🚀 Quick Supabase Setup for POS CafeLux
 * One-command auto-migration script
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 POS CafeLux - Quick Supabase Setup\n');

function log(message, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  console.log(`${icons[type]} ${message}`);
}

function runCommand(command, description) {
  try {
    log(`${description}...`, 'info');
    execSync(command, { stdio: 'inherit' });
    log(`${description} berhasil!`, 'success');
    return true;
  } catch (error) {
    log(`${description} gagal: ${error.message}`, 'error');
    return false;
  }
}

async function quickSetup() {
  try {
    // 1. Check if Supabase is already initialized
    if (!fs.existsSync('./supabase/config.toml')) {
      log('Initializing Supabase project...', 'info');
      if (!runCommand('npx supabase init', 'Supabase initialization')) {
        throw new Error('Failed to initialize Supabase');
      }
    } else {
      log('Supabase sudah diinisialisasi', 'success');
    }

    // 2. Check Docker and start local Supabase
    try {
      execSync('docker --version', { stdio: 'pipe' });
      execSync('docker ps', { stdio: 'pipe' });
      
      log('Docker tersedia, starting Supabase local...', 'info');
      if (runCommand('npx supabase start', 'Starting Supabase local stack')) {
        
        // 3. Apply migrations
        if (runCommand('npx supabase db reset', 'Applying database migrations')) {
          
          // 4. Get local credentials
          const status = execSync('npx supabase status', { encoding: 'utf8' });
          const apiUrlMatch = status.match(/API URL: (http:\/\/127\.0\.0\.1:\d+)/);
          const anonKeyMatch = status.match(/anon key: (eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/);
          const dbUrlMatch = status.match(/DB URL: (postgresql:\/\/[^\s]+)/);

          if (apiUrlMatch && anonKeyMatch && dbUrlMatch) {
            // 5. Create environment file
            const envContent = `# Supabase Local Configuration
VITE_SUPABASE_URL=${apiUrlMatch[1]}
VITE_SUPABASE_ANON_KEY=${anonKeyMatch[1]}
DATABASE_URL=${dbUrlMatch[1]}
NODE_ENV=development
SKIP_DATABASE=false
PORT=5002
`;
            
            fs.writeFileSync('.env.supabase', envContent);
            log('Environment file .env.supabase created!', 'success');
            
            // 6. Update main .env
            if (fs.existsSync('.env')) {
              let mainEnv = fs.readFileSync('.env', 'utf8');
              if (!mainEnv.includes('DATABASE_URL')) {
                mainEnv += `\nDATABASE_URL=${dbUrlMatch[1]}\n`;
                fs.writeFileSync('.env', mainEnv);
                log('DATABASE_URL added to .env', 'success');
              }
            }

            console.log('\n🎉 Supabase Local Setup Complete!');
            console.log('\n📋 Next Steps:');
            console.log('1. Restart your application to use Supabase');
            console.log('2. Visit http://127.0.0.1:54323 for Supabase Studio');
            console.log('3. Your app will now use real PostgreSQL database');
            
            console.log('\n🔧 Supabase Management:');
            console.log('• View status: npx supabase status');
            console.log('• Stop: npx supabase stop');
            console.log('• Reset DB: npx supabase db reset');
            
            return true;
          }
        }
      }
    } catch (dockerError) {
      log('Docker tidak tersedia, setup manual diperlukan', 'warning');
      
      console.log('\n☁️ Untuk menggunakan Supabase Cloud:');
      console.log('1. Buat project di https://supabase.com');
      console.log('2. Copy migrations dari supabase/migrations/ ke SQL Editor');
      console.log('3. Update .env dengan credentials Supabase Cloud');
      console.log('4. Jalankan: npx tsx setup-supabase.js');
      
      return false;
    }

  } catch (error) {
    log(`Setup failed: ${error.message}`, 'error');
    return false;
  }
}

quickSetup();
