#!/usr/bin/env node

/**
 * POS CafeLux - Supabase Status Checker
 * Mengecek status koneksi Supabase dan memberikan panduan setup
 */

import fs from 'fs';
import { Pool } from 'pg';

// Color codes untuk output console
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

async function checkEnvFiles() {
  log('blue', '📋 Mengecek file environment...');
  
  const envFiles = ['.env', '.env.supabase', '.env.production', '.env.test'];
  const foundFiles = [];
  
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
      log('green', `✅ Ditemukan: ${file}`);
    }
  }
  
  if (foundFiles.length === 0) {
    log('red', '❌ Tidak ada file .env ditemukan');
    return null;
  }
  
  return foundFiles;
}

async function checkCurrentConnection() {
  log('blue', '\n🔍 Mengecek koneksi database saat ini...');
  
  // Cek environment variables
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!databaseUrl) {
    log('yellow', '⚠️  DATABASE_URL tidak ditemukan di environment');
    return false;
  }
  
  log('cyan', `📋 DATABASE_URL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);
  
  if (supabaseUrl) {
    log('cyan', `📋 SUPABASE_URL: ${supabaseUrl}`);
  }
  
  // Test koneksi
  try {
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    
    log('green', '✅ Koneksi database berhasil!');
    log('cyan', `   Server time: ${result.rows[0].current_time}`);
    
    client.release();
    await pool.end();
    return true;
    
  } catch (error) {
    log('red', `❌ Koneksi database gagal: ${error.message}`);
    return false;
  }
}

async function generateSupabaseTemplate() {
  log('blue', '\n📝 Template konfigurasi Supabase:');
  
  const template = `# POS CafeLux - Supabase Configuration
# Ganti dengan kredensial Supabase Anda yang sebenarnya

# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Application Configuration
NODE_ENV=development
PORT=5000
SESSION_SECRET=pos-cafelux-secret-key-ganti-ini

# Features
ENABLE_SUPABASE=true
ENABLE_REALTIME=true
`;

  console.log(template);
  
  // Simpan template ke file
  fs.writeFileSync('.env.supabase.template', template);
  log('green', '✅ Template disimpan ke .env.supabase.template');
}

async function showSetupInstructions() {
  log('magenta', '\n🚀 Panduan Setup Supabase:');
  
  console.log(`
${colors.yellow}1. Buat Project Supabase:${colors.reset}
   - Kunjungi: https://supabase.com
   - Klik "New Project"
   - Isi nama: pos-cafelux
   - Buat password database yang kuat
   - Pilih region terdekat

${colors.yellow}2. Dapatkan Kredensial:${colors.reset}
   - Masuk ke Settings > API
   - Copy Project URL, Anon Key, Service Role Key
   - Masuk ke Settings > Database
   - Copy Connection String

${colors.yellow}3. Jalankan Migrasi Database:${colors.reset}
   - Buka Supabase Dashboard > SQL Editor
   - Copy isi file supabase-migration.sql
   - Paste dan jalankan

${colors.yellow}4. Update File .env:${colors.reset}
   - Copy .env.supabase.template ke .env
   - Ganti YOUR_PROJECT_REF dengan project reference Anda
   - Ganti YOUR_PASSWORD dengan password database Anda
   - Ganti kredensial lainnya

${colors.yellow}5. Test Koneksi:${colors.reset}
   npx tsx diagnose-supabase.js

${colors.yellow}6. Jalankan Aplikasi:${colors.reset}
   npm run dev
`);
}

async function main() {
  log('magenta', '🔍 POS CafeLux - Supabase Status Checker');
  log('magenta', '==========================================\n');
  
  // Cek file environment
  const envFiles = await checkEnvFiles();
  
  // Cek koneksi saat ini
  const isConnected = await checkCurrentConnection();
  
  if (isConnected) {
    log('green', '\n🎉 Supabase sudah terkonfigurasi dan berfungsi!');
    log('blue', '\n📋 Status aplikasi:');
    console.log('✅ Database: Terhubung ke Supabase');
    console.log('✅ Aplikasi: Siap untuk produksi');
    console.log('✅ Data: Persisten di cloud');
  } else {
    log('yellow', '\n⚠️  Supabase belum terkonfigurasi');
    log('blue', '\n📋 Status aplikasi:');
    console.log('🔄 Database: Menggunakan MemStorage (sementara)');
    console.log('⚠️  Data: Akan hilang saat server restart');
    console.log('🎯 Perlu: Setup Supabase untuk data persisten');
    
    // Generate template dan instruksi
    await generateSupabaseTemplate();
    await showSetupInstructions();
  }
  
  log('blue', '\n📋 Tools yang tersedia:');
  console.log('- npx tsx setup-supabase.js        (Setup wizard interaktif)');
  console.log('- npx tsx diagnose-supabase.js     (Diagnostic koneksi)');
  console.log('- npx tsx fix-supabase-connection.js (Perbaikan koneksi)');
}

main().catch(console.error);
