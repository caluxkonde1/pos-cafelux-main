-- 🚀 POS CafeLux - MySQL Migration for Niagahoster
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
