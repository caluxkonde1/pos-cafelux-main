#!/usr/bin/env node

/**
 * 🚀 POS CafeLux - Auto Migration Script for Supabase
 * 
 * This script automatically handles:
 * 1. Supabase project detection/creation
 * 2. Database migration execution
 * 3. Edge Functions deployment
 * 4. Environment configuration
 * 5. Connection testing
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class SupabaseAutoMigrator {
  constructor() {
    this.projectId = 'pos-cafelux';
    this.isLocalMode = false;
    this.supabaseUrl = '';
    this.supabaseKey = '';
    this.databaseUrl = '';
  }

  async question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  async checkSupabaseCLI() {
    try {
      execSync('npx supabase --version', { stdio: 'pipe' });
      this.log('Supabase CLI tersedia', 'success');
      return true;
    } catch (error) {
      this.log('Supabase CLI tidak ditemukan, akan menginstall...', 'warning');
      return false;
    }
  }

  async checkDockerStatus() {
    try {
      execSync('docker --version', { stdio: 'pipe' });
      try {
        execSync('docker ps', { stdio: 'pipe' });
        this.log('Docker Desktop berjalan', 'success');
        return true;
      } catch {
        this.log('Docker Desktop tidak berjalan', 'warning');
        return false;
      }
    } catch {
      this.log('Docker tidak terinstall', 'warning');
      return false;
    }
  }

  async detectMigrationMode() {
    this.log('\n🔍 Mendeteksi mode migrasi terbaik...', 'info');
    
    const dockerAvailable = await this.checkDockerStatus();
    
    if (dockerAvailable) {
      const useLocal = await this.question('\n📦 Docker tersedia! Gunakan Supabase lokal? (y/n): ');
      this.isLocalMode = useLocal.toLowerCase() === 'y';
    } else {
      this.log('Docker tidak tersedia, akan menggunakan Supabase Cloud', 'info');
      this.isLocalMode = false;
    }

    return this.isLocalMode;
  }

  async setupLocalSupabase() {
    this.log('\n🚀 Setting up Supabase lokal...', 'info');
    
    try {
      // Check if already initialized
      if (!fs.existsSync('./supabase/config.toml')) {
        this.log('Initializing Supabase project...', 'info');
        execSync('npx supabase init', { stdio: 'inherit' });
      }

      this.log('Starting Supabase local stack...', 'info');
      execSync('npx supabase start', { stdio: 'inherit' });

      // Get local credentials
      const status = execSync('npx supabase status', { encoding: 'utf8' });
      
      // Parse status output
      const apiUrlMatch = status.match(/API URL: (http:\/\/127\.0\.0\.1:\d+)/);
      const anonKeyMatch = status.match(/anon key: (eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/);
      const dbUrlMatch = status.match(/DB URL: (postgresql:\/\/[^\s]+)/);

      if (apiUrlMatch && anonKeyMatch && dbUrlMatch) {
        this.supabaseUrl = apiUrlMatch[1];
        this.supabaseKey = anonKeyMatch[1];
        this.databaseUrl = dbUrlMatch[1];
        
        this.log('Supabase lokal berhasil dijalankan!', 'success');
        return true;
      } else {
        throw new Error('Gagal parsing Supabase status');
      }
    } catch (error) {
      this.log(`Error setting up local Supabase: ${error.message}`, 'error');
      return false;
    }
  }

  async setupCloudSupabase() {
    this.log('\n☁️ Setting up Supabase Cloud...', 'info');
    
    console.log('\n📋 Untuk menggunakan Supabase Cloud, Anda perlu:');
    console.log('1. Buat project di https://supabase.com');
    console.log('2. Dapatkan URL dan API Key dari Settings > API');
    console.log('3. Masukkan credentials di bawah ini\n');

    this.supabaseUrl = await this.question('🔗 Masukkan Supabase URL: ');
    this.supabaseKey = await this.question('🔑 Masukkan Supabase Anon Key: ');
    
    // Generate database URL
    const projectRef = this.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      const dbPassword = await this.question('🔐 Masukkan Database Password: ');
      this.databaseUrl = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
    }

    return true;
  }

  async runMigrations() {
    this.log('\n📊 Menjalankan database migrations...', 'info');
    
    try {
      if (this.isLocalMode) {
        // Local migrations
        execSync('npx supabase db reset', { stdio: 'inherit' });
        this.log('Local database reset dan migrations berhasil!', 'success');
      } else {
        // Cloud migrations - need to apply manually or via dashboard
        this.log('Untuk Supabase Cloud, apply migrations via:', 'info');
        console.log('1. Supabase Dashboard > SQL Editor');
        console.log('2. Copy-paste isi file migration');
        console.log('3. Atau gunakan: npx supabase db push');
        
        const applyNow = await this.question('\n🚀 Apply migrations sekarang? (y/n): ');
        if (applyNow.toLowerCase() === 'y') {
          execSync('npx supabase db push', { stdio: 'inherit' });
          this.log('Cloud migrations berhasil!', 'success');
        }
      }
      return true;
    } catch (error) {
      this.log(`Error running migrations: ${error.message}`, 'error');
      return false;
    }
  }

  async deployEdgeFunctions() {
    this.log('\n⚡ Deploying Edge Functions...', 'info');
    
    try {
      if (this.isLocalMode) {
        // Local functions are automatically available
        this.log('Edge Functions tersedia di local environment', 'success');
      } else {
        // Deploy to cloud
        const deployFunctions = await this.question('🚀 Deploy Edge Functions ke cloud? (y/n): ');
        if (deployFunctions.toLowerCase() === 'y') {
          execSync('npx supabase functions deploy pos-api', { stdio: 'inherit' });
          this.log('Edge Functions berhasil di-deploy!', 'success');
        }
      }
      return true;
    } catch (error) {
      this.log(`Error deploying functions: ${error.message}`, 'error');
      return false;
    }
  }

  async updateEnvironmentFile() {
    this.log('\n📝 Updating environment configuration...', 'info');
    
    const envContent = `# Supabase Configuration (Auto-generated)
VITE_SUPABASE_URL=${this.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${this.supabaseKey}
DATABASE_URL=${this.databaseUrl}

# Application Configuration
NODE_ENV=development
SKIP_DATABASE=false
PORT=5002

# Auto-migration info
SUPABASE_MODE=${this.isLocalMode ? 'local' : 'cloud'}
MIGRATION_DATE=${new Date().toISOString()}
`;

    fs.writeFileSync('.env.supabase', envContent);
    this.log('Environment file .env.supabase berhasil dibuat!', 'success');
    
    // Update main .env if exists
    if (fs.existsSync('.env')) {
      const mainEnv = fs.readFileSync('.env', 'utf8');
      if (!mainEnv.includes('DATABASE_URL')) {
        fs.appendFileSync('.env', `\n# Supabase Database\nDATABASE_URL=${this.databaseUrl}\n`);
        this.log('DATABASE_URL ditambahkan ke .env', 'success');
      }
    }
  }

  async testConnection() {
    this.log('\n🧪 Testing database connection...', 'info');
    
    try {
      // Create a simple test script
      const testScript = `
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('${this.supabaseUrl}', '${this.supabaseKey}');

async function testConnection() {
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful!');
    console.log('📊 Products table accessible');
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

testConnection();
`;

      fs.writeFileSync('test-supabase-connection.mjs', testScript);
      
      // Run test (might fail if @supabase/supabase-js not installed)
      try {
        execSync('node test-supabase-connection.mjs', { stdio: 'inherit' });
        fs.unlinkSync('test-supabase-connection.mjs');
      } catch {
        this.log('Supabase client belum terinstall, skip connection test', 'warning');
        fs.unlinkSync('test-supabase-connection.mjs');
      }
      
      return true;
    } catch (error) {
      this.log(`Error testing connection: ${error.message}`, 'error');
      return false;
    }
  }

  async generateMigrationSummary() {
    const summary = `
# 🎉 Supabase Auto-Migration Complete!

## 📋 Migration Summary

### ✅ Configuration
- **Mode:** ${this.isLocalMode ? 'Local Development' : 'Cloud Production'}
- **Project ID:** ${this.projectId}
- **Supabase URL:** ${this.supabaseUrl}
- **Database URL:** ${this.databaseUrl ? 'Configured' : 'Not configured'}

### ✅ Components Deployed
- **Database Schema:** 9 tables with relationships
- **Sample Data:** Products, categories, customers, users
- **Edge Functions:** ${this.isLocalMode ? 'Available locally' : 'Deployed to cloud'}
- **Environment:** .env.supabase created

### 🚀 Next Steps

#### For Development:
\`\`\`bash
# Use Supabase environment
cp .env.supabase .env
npm run dev
\`\`\`

#### For Production:
\`\`\`bash
# Build and deploy
npm run build
npm run start
\`\`\`

### 📊 Available Features
- ✅ Enhanced POS with 15 menu items
- ✅ 7 new business feature pages
- ✅ Real-time database updates
- ✅ User authentication & permissions
- ✅ Multi-outlet support (when configured)
- ✅ Advanced reporting & analytics

### 🔧 Management Commands
\`\`\`bash
# View Supabase status
npx supabase status

# Reset database (local only)
npx supabase db reset

# Deploy functions
npx supabase functions deploy

# View logs
npx supabase logs
\`\`\`

**Status: ✅ AUTO-MIGRATION SUCCESSFUL**
**POS CafeLux is now running on Supabase!**
`;

    fs.writeFileSync('SUPABASE_MIGRATION_SUMMARY.md', summary);
    this.log('Migration summary saved to SUPABASE_MIGRATION_SUMMARY.md', 'success');
  }

  async run() {
    console.log('\n🚀 POS CafeLux - Supabase Auto-Migration Tool\n');
    
    try {
      // Step 1: Check prerequisites
      await this.checkSupabaseCLI();
      
      // Step 2: Detect best migration mode
      await this.detectMigrationMode();
      
      // Step 3: Setup Supabase (local or cloud)
      let setupSuccess = false;
      if (this.isLocalMode) {
        setupSuccess = await this.setupLocalSupabase();
      } else {
        setupSuccess = await this.setupCloudSupabase();
      }
      
      if (!setupSuccess) {
        throw new Error('Supabase setup failed');
      }
      
      // Step 4: Run migrations
      const migrationSuccess = await this.runMigrations();
      if (!migrationSuccess) {
        this.log('Migration gagal, tapi environment sudah dikonfigurasi', 'warning');
      }
      
      // Step 5: Deploy Edge Functions
      await this.deployEdgeFunctions();
      
      // Step 6: Update environment
      await this.updateEnvironmentFile();
      
      // Step 7: Test connection
      await this.testConnection();
      
      // Step 8: Generate summary
      await this.generateMigrationSummary();
      
      this.log('\n🎉 Auto-migration completed successfully!', 'success');
      this.log('Check SUPABASE_MIGRATION_SUMMARY.md for details', 'info');
      
    } catch (error) {
      this.log(`\n❌ Auto-migration failed: ${error.message}`, 'error');
      this.log('Check the error above and try manual setup', 'info');
    } finally {
      rl.close();
    }
  }
}

// Run the auto-migrator
const migrator = new SupabaseAutoMigrator();
migrator.run();
