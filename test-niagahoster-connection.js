#!/usr/bin/env node

/**
 * 🧪 Test Niagahoster Database Connection
 */

import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function testConnection() {
  console.log('🧪 Testing Niagahoster Database Connection\n');
  
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.log('❌ DATABASE_URL not found in environment');
      console.log('💡 Make sure to set DATABASE_URL in your .env file');
      return false;
    }
    
    console.log('🔗 Connecting to database...');
    
    // Parse database URL
    const url = new URL(dbUrl);
    
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      } : false
    };
    
    const connection = await mysql.createConnection(config);
    
    // Test basic connection
    await connection.execute('SELECT 1 as test');
    console.log('✅ Basic connection successful');
    
    // Test database structure
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables in database`);
    
    // Test sample data
    try {
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
      console.log(`✅ Products table: ${products[0].count} records`);
    } catch (error) {
      console.log('⚠️  Products table not found - run migration first');
    }
    
    await connection.end();
    
    console.log('\n🎉 Niagahoster database connection test successful!');
    return true;
    
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL format');
    console.log('2. Verify database credentials in Niagahoster cPanel');
    console.log('3. Ensure database exists and is accessible');
    console.log('4. Check if SSL is required');
    return false;
  }
}

testConnection();
