const { Pool } = require('pg');
const fs = require('fs');

// Database configuration for local PostgreSQL
const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'pos_cafelux',
  user: 'postgres',
  password: 'password123'
};

const CONNECTION_STRING = `postgresql://${LOCAL_DB_CONFIG.user}:${LOCAL_DB_CONFIG.password}@${LOCAL_DB_CONFIG.host}:${LOCAL_DB_CONFIG.port}/${LOCAL_DB_CONFIG.database}`;

console.log('🚀 Setting up Local PostgreSQL Database for Navicat Access');
console.log('=' .repeat(60));

async function setupLocalDatabase() {
  let pool;
  
  try {
    // First, connect to default postgres database to create our database
    console.log('📡 Connecting to PostgreSQL server...');
    const adminPool = new Pool({
      host: LOCAL_DB_CONFIG.host,
      port: LOCAL_DB_CONFIG.port,
      database: 'postgres', // Connect to default database first
      user: LOCAL_DB_CONFIG.user,
      password: LOCAL_DB_CONFIG.password,
    });

    // Test connection
    await adminPool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL server successfully');

    // Create database if it doesn't exist
    console.log(`🗄️ Creating database '${LOCAL_DB_CONFIG.database}'...`);
    try {
      await adminPool.query(`CREATE DATABASE ${LOCAL_DB_CONFIG.database}`);
      console.log(`✅ Database '${LOCAL_DB_CONFIG.database}' created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`ℹ️ Database '${LOCAL_DB_CONFIG.database}' already exists`);
      } else {
        throw error;
      }
    }

    await adminPool.end();

    // Now connect to our specific database
    console.log(`🔗 Connecting to database '${LOCAL_DB_CONFIG.database}'...`);
    pool = new Pool(LOCAL_DB_CONFIG);
    
    // Test connection to our database
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected to POS database successfully');
    console.log(`⏰ Current time: ${result.rows[0].current_time}`);

    // Create tables using schema
    console.log('📋 Creating database tables...');
    
    // Read and execute schema
    const schemaSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'staff',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        warna VARCHAR(7) DEFAULT '#3b82f6',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        kode VARCHAR(100) UNIQUE,
        kategori_id INTEGER REFERENCES categories(id),
        harga DECIMAL(10,2) NOT NULL,
        stok INTEGER DEFAULT 0,
        stok_minimum INTEGER DEFAULT 5,
        deskripsi TEXT,
        gambar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Transactions table
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        kode_transaksi VARCHAR(100) UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash',
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'completed',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Transaction items table
      CREATE TABLE IF NOT EXISTS transaction_items (
        id SERIAL PRIMARY KEY,
        transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Customers table
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        total_purchases DECIMAL(10,2) DEFAULT 0,
        last_purchase_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Inventory table
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment'
        quantity INTEGER NOT NULL,
        reason VARCHAR(255),
        reference_id INTEGER, -- transaction_id for sales
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Cash flow table
      CREATE TABLE IF NOT EXISTS cash_flow (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL, -- 'income', 'expense'
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        reference_id INTEGER, -- transaction_id for sales
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tables management
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        table_number VARCHAR(10) UNIQUE NOT NULL,
        capacity INTEGER DEFAULT 4,
        status VARCHAR(50) DEFAULT 'available', -- 'available', 'occupied', 'reserved'
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Reservations table
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        reservation_date TIMESTAMP NOT NULL,
        party_size INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Reminders table
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'general', -- 'stock', 'payment', 'general'
        priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
        due_date TIMESTAMP,
        is_completed BOOLEAN DEFAULT false,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_products_kategori ON products(kategori_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
      CREATE INDEX IF NOT EXISTS idx_cash_flow_date ON cash_flow(created_at);
      CREATE INDEX IF NOT EXISTS idx_reservations_table ON reservations(table_id);
      CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
    `;

    await pool.query(schemaSQL);
    console.log('✅ Database tables created successfully');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    const sampleDataSQL = `
      -- Insert default admin user
      INSERT INTO users (username, password, email, role) 
      VALUES ('admin', 'admin123', 'admin@cafelux.com', 'admin')
      ON CONFLICT (username) DO NOTHING;

      -- Insert sample categories
      INSERT INTO categories (nama, deskripsi, warna, sort_order) VALUES
      ('Makanan', 'Produk makanan dan snack', '#ef4444', 1),
      ('Minuman', 'Minuman segar dan sehat', '#10b981', 2),
      ('Elektronik', 'Perangkat elektronik', '#3b82f6', 3),
      ('Rumah Tangga', 'Keperluan rumah tangga', '#f59e0b', 4),
      ('Kesehatan', 'Produk kesehatan dan kebersihan', '#8b5cf6', 5)
      ON CONFLICT DO NOTHING;

      -- Insert sample products
      INSERT INTO products (nama, kode, kategori_id, harga, stok, stok_minimum, deskripsi) VALUES
      ('Roti Tawar Sari Roti', 'RTW001', 1, 8500, 50, 10, 'Roti tawar segar untuk sarapan'),
      ('Susu Ultra 1L', 'SUS001', 2, 12000, 30, 5, 'Susu segar ultra pasteurisasi'),
      ('Indomie Goreng', 'IDM001', 1, 3500, 100, 20, 'Mie instan rasa ayam bawang'),
      ('Air Mineral Aqua 600ml', 'AQA001', 2, 3000, 200, 50, 'Air mineral dalam kemasan')
      ON CONFLICT (kode) DO NOTHING;

      -- Insert sample tables
      INSERT INTO tables (table_number, capacity, status) VALUES
      ('T01', 4, 'available'),
      ('T02', 2, 'available'),
      ('T03', 6, 'available'),
      ('T04', 4, 'occupied'),
      ('T05', 8, 'available')
      ON CONFLICT (table_number) DO NOTHING;
    `;

    await pool.query(sampleDataSQL);
    console.log('✅ Sample data inserted successfully');

    // Create .env configuration
    console.log('📄 Creating .env configuration...');
    const envConfig = `
# Database Configuration for Local PostgreSQL
DATABASE_URL=${CONNECTION_STRING}
USE_LOCAL_DB=true
SKIP_DATABASE=false

# Server Configuration
PORT=5001
NODE_ENV=development

# Disable mock data when using real database
USE_MOCK_DATA=false
`;

    fs.writeFileSync('.env.local', envConfig.trim());
    console.log('✅ .env.local file created');

    console.log('\n🎉 LOCAL POSTGRESQL SETUP COMPLETED!');
    console.log('=' .repeat(60));
    console.log('📊 NAVICAT CONNECTION DETAILS:');
    console.log(`   Host: ${LOCAL_DB_CONFIG.host}`);
    console.log(`   Port: ${LOCAL_DB_CONFIG.port}`);
    console.log(`   Database: ${LOCAL_DB_CONFIG.database}`);
    console.log(`   Username: ${LOCAL_DB_CONFIG.user}`);
    console.log(`   Password: ${LOCAL_DB_CONFIG.password}`);
    console.log('=' .repeat(60));
    console.log('🔧 NEXT STEPS:');
    console.log('1. Install PostgreSQL locally if not installed');
    console.log('2. Start PostgreSQL service');
    console.log('3. Open Navicat and create new PostgreSQL connection');
    console.log('4. Use the connection details above');
    console.log('5. Restart your application with: npm run dev');
    console.log('=' .repeat(60));

    await pool.end();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Check if user "postgres" exists with password "password123"');
    console.log('3. Verify PostgreSQL is listening on port 5432');
    console.log('4. Try connecting manually: psql -h localhost -U postgres');
    
    if (pool) {
      await pool.end();
    }
    process.exit(1);
  }
}

setupLocalDatabase();
