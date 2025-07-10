#!/usr/bin/env node

/**
 * 🚀 POS CafeLux - Niagahoster Database Setup
 * 
 * Script untuk mempersiapkan database connection ke Niagahoster.com
 * Includes: MySQL/PostgreSQL setup, migration scripts, dan configuration
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 POS CafeLux - Niagahoster Database Setup\n');

function log(message, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  console.log(`${icons[type]} ${message}`);
}

function createNiagahosterConfig() {
  log('Creating Niagahoster database configuration...', 'info');
  
  const niagahosterConfig = `# 🚀 POS CafeLux - Niagahoster Database Configuration
# Ganti dengan kredensial database Niagahoster Anda

# Niagahoster Database Configuration
# Format: mysql://username:password@hostname:port/database_name
DATABASE_URL=mysql://your_username:your_password@your_hostname:3306/your_database_name

# Alternative PostgreSQL (jika menggunakan PostgreSQL di Niagahoster)
# DATABASE_URL=postgresql://your_username:your_password@your_hostname:5432/your_database_name

# Database Type (mysql atau postgresql)
DB_TYPE=mysql

# Database Connection Details (untuk backup configuration)
DB_HOST=your_hostname.niagahoster.com
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_username
DB_PASS=your_password

# SSL Configuration (biasanya required untuk hosting)
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Application Configuration
NODE_ENV=production
PORT=5002
SESSION_SECRET=pos-cafelux-niagahoster-secret-key-ganti-ini

# Features
ENABLE_DATABASE=true
ENABLE_REALTIME=false
SKIP_DATABASE=false

# Niagahoster Specific
HOSTING_PROVIDER=niagahoster
DEPLOYMENT_MODE=production
`;

  fs.writeFileSync('.env.niagahoster', niagahosterConfig);
  log('Niagahoster configuration saved to .env.niagahoster', 'success');
}

function createMySQLMigrations() {
  log('Creating MySQL migration scripts for Niagahoster...', 'info');
  
  const mysqlMigration = `-- 🚀 POS CafeLux - MySQL Migration for Niagahoster
-- Execute this script in your Niagahoster cPanel > phpMyAdmin

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS pos_cafelux CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos_cafelux;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'kasir', 'manager') DEFAULT 'kasir',
  is_active BOOLEAN DEFAULT TRUE,
  subscription_plan ENUM('FREE', 'PRO', 'ENTERPRISE') DEFAULT 'FREE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(200) NOT NULL,
  kode VARCHAR(50) UNIQUE NOT NULL,
  deskripsi TEXT,
  harga DECIMAL(15,2) NOT NULL,
  stok INT DEFAULT 0,
  kategori_id INT,
  gambar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telepon VARCHAR(20),
  alamat TEXT,
  tanggal_lahir DATE,
  jenis_kelamin ENUM('L', 'P'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_transaksi VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT,
  user_id INT NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'digital') DEFAULT 'cash',
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 6. Transaction Items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 7. Outlets table (for multi-outlet support)
CREATE TABLE IF NOT EXISTS outlets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(20),
  email VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  outlet_id INT,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  position VARCHAR(50),
  salary DECIMAL(15,2),
  hire_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL
);

-- 9. Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  outlet_id INT,
  stock_quantity INT DEFAULT 0,
  min_stock_level INT DEFAULT 0,
  max_stock_level INT DEFAULT 1000,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_products_kategori ON products(kategori_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);

-- Insert sample data
INSERT IGNORE INTO categories (id, nama, deskripsi) VALUES
(1, 'Makanan', 'Produk makanan dan snack'),
(2, 'Minuman', 'Berbagai jenis minuman'),
(3, 'Kopi', 'Produk kopi dan turunannya'),
(4, 'Dessert', 'Makanan penutup dan kue'),
(5, 'Merchandise', 'Produk merchandise cafe');

INSERT IGNORE INTO users (id, username, email, password_hash, full_name, role, subscription_plan) VALUES
(1, 'admin', 'admin@cafelux.com', '$2b$10$hash_placeholder', 'Administrator', 'admin', 'PRO'),
(2, 'kasir1', 'kasir1@cafelux.com', '$2b$10$hash_placeholder', 'Kasir Satu', 'kasir', 'FREE'),
(3, 'manager', 'manager@cafelux.com', '$2b$10$hash_placeholder', 'Manager Cafe', 'manager', 'PRO');

INSERT IGNORE INTO outlets (id, nama, alamat, telepon, email) VALUES
(1, 'CafeLux Main', 'Jl. Sudirman No. 123, Jakarta', '021-1234567', 'main@cafelux.com');

INSERT IGNORE INTO products (id, nama, kode, deskripsi, harga, stok, kategori_id) VALUES
(1, 'Roti Tawar Sari Roti', 'RTW001', 'Roti tawar segar untuk sarapan', 15000, 50, 1),
(2, 'Kopi Americano', 'KOP001', 'Kopi hitam klasik', 25000, 100, 3),
(3, 'Teh Manis', 'TEH001', 'Teh manis segar', 12000, 80, 2),
(4, 'Nasi Goreng Spesial', 'NGS001', 'Nasi goreng dengan telur dan ayam', 35000, 30, 1),
(5, 'Es Krim Vanilla', 'ESK001', 'Es krim vanilla premium', 18000, 25, 4),
(6, 'Cappuccino', 'CAP001', 'Kopi dengan foam susu', 30000, 60, 3),
(7, 'Sandwich Club', 'SAN001', 'Sandwich dengan isi lengkap', 28000, 20, 1),
(8, 'Jus Jeruk Fresh', 'JUS001', 'Jus jeruk segar tanpa gula', 20000, 40, 2);

INSERT IGNORE INTO customers (id, nama, email, telepon) VALUES
(1, 'John Doe', 'john@example.com', '081234567890'),
(2, 'Jane Smith', 'jane@example.com', '081234567891'),
(3, 'Bob Wilson', 'bob@example.com', '081234567892');

-- Sample transaction
INSERT IGNORE INTO transactions (id, nomor_transaksi, customer_id, user_id, total_amount, payment_method, status) VALUES
(1, 'T1752139951319', 1, 2, 52000, 'cash', 'completed');

INSERT IGNORE INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 2, 15000, 30000),
(1, 3, 1, 12000, 12000),
(1, 5, 1, 18000, 18000);

-- Success message
SELECT 'POS CafeLux MySQL database setup completed successfully!' as message;
`;

  fs.writeFileSync('niagahoster-mysql-migration.sql', mysqlMigration);
  log('MySQL migration script saved to niagahoster-mysql-migration.sql', 'success');
}

function createDatabaseAdapter() {
  log('Creating database adapter for Niagahoster...', 'info');
  
  const dbAdapter = `// 🚀 POS CafeLux - Niagahoster Database Adapter
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../shared/schema.js';

let connection;
let db;

export async function initializeDatabase() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

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
      } : false,
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    };

    console.log('🔗 Connecting to Niagahoster MySQL database...');
    
    connection = mysql.createPool(config);
    db = drizzle(connection, { schema, mode: 'default' });
    
    // Test connection
    await connection.execute('SELECT 1');
    console.log('✅ Connected to Niagahoster database successfully!');
    
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to Niagahoster database:', error.message);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export async function closeDatabase() {
  if (connection) {
    await connection.end();
    console.log('🔌 Database connection closed');
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    if (!connection) {
      return { status: 'disconnected', message: 'No database connection' };
    }
    
    await connection.execute('SELECT 1');
    return { status: 'healthy', message: 'Database connection is healthy' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export { db, connection };
`;

  fs.writeFileSync('server/niagahoster-db.js', dbAdapter);
  log('Database adapter saved to server/niagahoster-db.js', 'success');
}

function updatePackageJson() {
  log('Adding MySQL dependencies...', 'info');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Add MySQL dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      'mysql2': '^3.11.4',
      'drizzle-orm': '^0.39.1'
    };
    
    // Add Niagahoster specific scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'db:migrate:niagahoster': 'echo "Apply niagahoster-mysql-migration.sql to your Niagahoster database"',
      'db:test:niagahoster': 'node test-niagahoster-connection.js',
      'deploy:niagahoster': 'npm run build && echo "Upload dist/ to your Niagahoster hosting"'
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    log('Package.json updated with MySQL dependencies', 'success');
  } catch (error) {
    log(`Error updating package.json: ${error.message}`, 'error');
  }
}

function createConnectionTest() {
  log('Creating connection test script...', 'info');
  
  const testScript = `#!/usr/bin/env node

/**
 * 🧪 Test Niagahoster Database Connection
 */

import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function testConnection() {
  console.log('🧪 Testing Niagahoster Database Connection\\n');
  
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
    console.log(\`✅ Found \${tables.length} tables in database\`);
    
    // Test sample data
    try {
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
      console.log(\`✅ Products table: \${products[0].count} records\`);
    } catch (error) {
      console.log('⚠️  Products table not found - run migration first');
    }
    
    await connection.end();
    
    console.log('\\n🎉 Niagahoster database connection test successful!');
    return true;
    
  } catch (error) {
    console.log(\`❌ Connection failed: \${error.message}\`);
    console.log('\\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL format');
    console.log('2. Verify database credentials in Niagahoster cPanel');
    console.log('3. Ensure database exists and is accessible');
    console.log('4. Check if SSL is required');
    return false;
  }
}

testConnection();
`;

  fs.writeFileSync('test-niagahoster-connection.js', testScript);
  log('Connection test script saved to test-niagahoster-connection.js', 'success');
}

function createDeploymentGuide() {
  log('Creating Niagahoster deployment guide...', 'info');
  
  const deploymentGuide = `# 🚀 POS CafeLux - Niagahoster Deployment Guide

## 📋 Langkah-langkah Setup Database di Niagahoster

### 1. 🗄️ Buat Database MySQL
1. Login ke cPanel Niagahoster
2. Masuk ke **MySQL Databases**
3. Buat database baru: \`pos_cafelux\`
4. Buat user database dengan password yang kuat
5. Assign user ke database dengan **ALL PRIVILEGES**

### 2. 📊 Import Database Schema
1. Masuk ke **phpMyAdmin** di cPanel
2. Pilih database \`pos_cafelux\`
3. Klik tab **SQL**
4. Copy-paste isi file \`niagahoster-mysql-migration.sql\`
5. Klik **Go** untuk execute

### 3. 🔧 Konfigurasi Environment
1. Copy file \`.env.niagahoster\` ke \`.env\`
2. Update dengan kredensial database Anda:

\`\`\`env
# Ganti dengan kredensial Niagahoster Anda
DATABASE_URL=mysql://username:password@hostname:3306/pos_cafelux
DB_HOST=hostname.niagahoster.com
DB_NAME=pos_cafelux
DB_USER=your_username
DB_PASS=your_password
\`\`\`

### 4. 🧪 Test Koneksi
\`\`\`bash
# Install dependencies
npm install mysql2

# Test connection
node test-niagahoster-connection.js
\`\`\`

### 5. 🚀 Deploy Aplikasi
\`\`\`bash
# Build aplikasi
npm run build

# Upload folder dist/ ke public_html di cPanel File Manager
# Atau gunakan FTP/SFTP
\`\`\`

## 📋 Kredensial Database Niagahoster

### Format DATABASE_URL:
\`\`\`
mysql://username:password@hostname:3306/database_name
\`\`\`

### Contoh:
\`\`\`
mysql://cafelux_user:mypassword123@mysql.niagahoster.com:3306/cafelux_pos
\`\`\`

## 🔧 Troubleshooting

### Connection Timeout:
- Pastikan SSL diaktifkan jika required
- Check firewall settings
- Verify hostname dan port

### Access Denied:
- Pastikan user memiliki privileges yang cukup
- Check username dan password
- Verify database name

### Table Not Found:
- Pastikan migration script sudah dijalankan
- Check database name yang benar
- Verify table creation berhasil

## 📊 Monitoring & Maintenance

### Health Check:
\`\`\`bash
node test-niagahoster-connection.js
\`\`\`

### Database Backup:
- Gunakan phpMyAdmin Export feature
- Schedule regular backups via cPanel
- Consider automated backup solutions

### Performance Optimization:
- Monitor query performance
- Add indexes untuk queries yang sering digunakan
- Optimize database configuration

## 🎯 Production Checklist

- [ ] Database created dan configured
- [ ] Migration script executed
- [ ] Environment variables set
- [ ] Connection test passed
- [ ] Application built dan deployed
- [ ] SSL certificate configured
- [ ] Domain pointed to hosting
- [ ] Backup strategy implemented

## 📞 Support

Jika mengalami masalah:
1. Check Niagahoster documentation
2. Contact Niagahoster support
3. Verify database credentials di cPanel
4. Test connection dengan script yang disediakan

**Status: Ready for Niagahoster deployment! 🚀**
`;

  fs.writeFileSync('NIAGAHOSTER_DEPLOYMENT_GUIDE.md', deploymentGuide);
  log('Deployment guide saved to NIAGAHOSTER_DEPLOYMENT_GUIDE.md', 'success');
}

async function main() {
  try {
    console.log('🚀 Setting up POS CafeLux for Niagahoster deployment...\n');
    
    // Step 1: Create Niagahoster configuration
    createNiagahosterConfig();
    
    // Step 2: Create MySQL migration scripts
    createMySQLMigrations();
    
    // Step 3: Create database adapter
    createDatabaseAdapter();
    
    // Step 4: Update package.json
    updatePackageJson();
    
    // Step 5: Create connection test
    createConnectionTest();
    
    // Step 6: Create deployment guide
    createDeploymentGuide();
    
    console.log('\n🎉 Niagahoster setup completed successfully!');
    console.log('\n📋 Files created:');
    console.log('✅ .env.niagahoster - Environment configuration');
    console.log('✅ niagahoster-mysql-migration.sql - Database schema');
    console.log('✅ server/niagahoster-db.js - Database adapter');
    console.log('✅ test-niagahoster-connection.js - Connection test');
    console.log('✅ NIAGAHOSTER_DEPLOYMENT_GUIDE.md - Complete guide');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Setup database di Niagahoster cPanel');
    console.log('2. Update .env.niagahoster dengan kredensial Anda');
    console.log('3. Copy .env.niagahoster ke .env');
    console.log('4. Run: npm install mysql2');
    console.log('5. Test: node test-niagahoster-connection.js');
    console.log('6. Deploy: npm run build');
    
    console.log('\n📖 Read NIAGAHOSTER_DEPLOYMENT_GUIDE.md for detailed instructions');
    
  } catch (error) {
    log(`Setup failed: ${error.message}`, 'error');
  }
}

main();
