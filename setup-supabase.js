#!/usr/bin/env node

/**
 * POS CafeLux - Supabase Setup and Migration Script
 * This script helps you set up Supabase connection and migrate your database
 */

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🚀 POS CafeLux - Supabase Setup Wizard');
  console.log('=====================================\n');

  try {
    // Step 1: Get Supabase credentials
    console.log('📋 Step 1: Supabase Project Information');
    console.log('Please provide your Supabase project details:\n');

    const supabaseUrl = await askQuestion('Enter your Supabase Project URL (https://xxx.supabase.co): ');
    const supabaseAnonKey = await askQuestion('Enter your Supabase Anon Key: ');
    const supabaseServiceKey = await askQuestion('Enter your Supabase Service Role Key: ');
    const dbPassword = await askQuestion('Enter your Database Password: ');

    // Extract project reference from URL
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const databaseUrl = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

    console.log('\n🔍 Testing connection...');

    // Step 2: Test Supabase API connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      const { data, error } = await supabase.from('_test').select('*').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
        throw error;
      }
      console.log('✅ Supabase API connection successful');
    } catch (error) {
      console.log('❌ Supabase API connection failed:', error.message);
      console.log('Please check your URL and Anon Key');
      process.exit(1);
    }

    // Step 3: Test database connection
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ Database connection successful');
      console.log(`   Server time: ${result.rows[0].now}`);
      client.release();
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('Please check your database password and project reference');
      process.exit(1);
    }

    // Step 4: Create environment file
    console.log('\n📝 Creating environment configuration...');
    
    const envContent = `# POS CafeLux - Supabase Configuration
# Generated on ${new Date().toISOString()}

# Database Configuration
DATABASE_URL=${databaseUrl}

# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Application Configuration
NODE_ENV=development
PORT=5000
SESSION_SECRET=pos-cafelux-${Math.random().toString(36).substring(2, 15)}

# Features
ENABLE_SUPABASE=true
ENABLE_REALTIME=true
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Environment file (.env) created successfully');

    // Step 5: Run database migration
    console.log('\n🗄️  Running database migration...');
    
    const migrationSql = fs.readFileSync('supabase-migration.sql', 'utf8');
    
    try {
      const client = await pool.connect();
      await client.query(migrationSql);
      console.log('✅ Database migration completed successfully');
      client.release();
    } catch (error) {
      console.log('❌ Migration failed:', error.message);
      console.log('You may need to run the migration manually in Supabase SQL Editor');
    }

    // Step 6: Verify data
    console.log('\n🔍 Verifying migrated data...');
    
    try {
      const client = await pool.connect();
      
      // Check tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log(`✅ Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      // Check sample data
      const productsResult = await client.query('SELECT COUNT(*) FROM products');
      const categoriesResult = await client.query('SELECT COUNT(*) FROM categories');
      const customersResult = await client.query('SELECT COUNT(*) FROM customers');
      
      console.log('\n📊 Sample data verification:');
      console.log(`   Products: ${productsResult.rows[0].count}`);
      console.log(`   Categories: ${categoriesResult.rows[0].count}`);
      console.log(`   Customers: ${customersResult.rows[0].count}`);
      
      client.release();
    } catch (error) {
      console.log('⚠️  Data verification failed:', error.message);
    }

    await pool.end();

    // Step 7: Success message
    console.log('\n🎉 Supabase setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Stop your current development server (Ctrl+C)');
    console.log('2. Start the server with: npm run dev');
    console.log('3. Open http://localhost:5000 to test your application');
    console.log('\n💡 Your application is now connected to Supabase!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as setupSupabase };
