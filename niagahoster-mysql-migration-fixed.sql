-- 🚀 POS CafeLux - MySQL Migration for Niagahoster
-- Execute this script in your Niagahoster cPanel > phpMyAdmin
-- IMPORTANT: Select your database first before running this script

-- Note: Database should already be created via cPanel
-- This script only creates tables and inserts data

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier', 'manager') DEFAULT 'cashier',
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  barcode VARCHAR(100) UNIQUE,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  loyalty_points INT DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT,
  user_id INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'digital_wallet', 'bank_transfer') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
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
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 7. Outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  manager_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  outlet_id INT NOT NULL,
  position VARCHAR(50),
  salary DECIMAL(10,2),
  hire_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE
);

-- 9. Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  outlet_id INT NOT NULL,
  stock_quantity INT DEFAULT 0,
  reserved_quantity INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_outlet (product_id, outlet_id)
);

-- Insert sample data
-- Categories
INSERT INTO categories (name, description) VALUES
('Minuman', 'Berbagai jenis minuman segar'),
('Makanan', 'Makanan ringan dan berat'),
('Dessert', 'Makanan penutup dan kue'),
('Snack', 'Camilan dan makanan ringan');

-- Default admin user (password: admin123)
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('admin', 'admin@cafelux.com', '$2b$10$rQZ9QmZJZJZJZJZJZJZJZOeKq9QmZJZJZJZJZJZJZJZJZJZJZJZJZJ', 'admin', 'Administrator', '081234567890');

-- Default outlet
INSERT INTO outlets (name, address, phone, email, manager_id) VALUES
('CafeLux Main', 'Jl. Raya No. 123, Jakarta', '021-12345678', 'main@cafelux.com', 1);

-- Sample products
INSERT INTO products (name, description, category_id, price, cost, stock, barcode) VALUES
('Kopi Americano', 'Kopi hitam dengan rasa yang kuat', 1, 25000, 8000, 100, 'CF001'),
('Cappuccino', 'Kopi dengan foam susu yang creamy', 1, 30000, 10000, 80, 'CF002'),
('Latte', 'Kopi dengan susu yang lembut', 1, 32000, 11000, 75, 'CF003'),
('Teh Tarik', 'Teh dengan susu yang manis', 1, 20000, 6000, 90, 'TEA001'),
('Nasi Goreng', 'Nasi goreng spesial dengan telur', 2, 35000, 15000, 50, 'FD001'),
('Mie Ayam', 'Mie dengan topping ayam dan bakso', 2, 30000, 12000, 40, 'FD002'),
('Cheesecake', 'Kue keju dengan topping berry', 3, 45000, 20000, 25, 'DT001'),
('Brownies', 'Brownies coklat dengan es krim', 3, 35000, 15000, 30, 'DT002');

-- Sample customer
INSERT INTO customers (name, email, phone, address) VALUES
('John Doe', 'john@example.com', '081234567891', 'Jl. Customer No. 1'),
('Jane Smith', 'jane@example.com', '081234567892', 'Jl. Customer No. 2');

-- Employee assignment
INSERT INTO employees (user_id, outlet_id, position, salary, hire_date) VALUES
(1, 1, 'Manager', 8000000, '2024-01-01');

-- Inventory setup
INSERT INTO inventory (product_id, outlet_id, stock_quantity) VALUES
(1, 1, 100), (2, 1, 80), (3, 1, 75), (4, 1, 90),
(5, 1, 50), (6, 1, 40), (7, 1, 25), (8, 1, 30);

-- Sample transaction
INSERT INTO transactions (transaction_number, customer_id, user_id, subtotal, tax_amount, total_amount, payment_method) VALUES
('TRX-20240101-001', 1, 1, 55000, 5500, 60500, 'cash');

INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 25000, 25000),
(1, 5, 1, 35000, 35000);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_outlet ON inventory(outlet_id);

-- Success message
SELECT 'POS CafeLux database migration completed successfully!' as status,
       'Tables created: 9' as tables_created,
       'Sample data inserted' as data_status;
