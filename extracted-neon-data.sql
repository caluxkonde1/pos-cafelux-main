-- Extracted data from Replit Neon Database
-- Run this after the main migration script

-- Data for users table
DELETE FROM users;
SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false);
INSERT INTO users (id, username, password, email, nama, role, subscription_plan, subscription_status, subscription_expires_at, is_active, created_at) VALUES (1, 'admin', 'admin123', 'admin@qasir.com', 'Admin Toko', 'admin', 'pro_plus', 'active', NULL, true, '2025-07-05T07:24:48.961Z');
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true);

-- Data for categories table
DELETE FROM categories;
SELECT setval(pg_get_serial_sequence('categories', 'id'), 1, false);
INSERT INTO categories (id, nama, deskripsi, is_active) VALUES (1, 'Makanan', 'Produk makanan dan minuman', true);
INSERT INTO categories (id, nama, deskripsi, is_active) VALUES (2, 'Minuman', 'Berbagai jenis minuman', true);
INSERT INTO categories (id, nama, deskripsi, is_active) VALUES (3, 'Snack', 'Camilan dan makanan ringan', true);
INSERT INTO categories (id, nama, deskripsi, is_active) VALUES (4, 'Sembako', 'Kebutuhan pokok sehari-hari', true);
INSERT INTO categories (id, nama, deskripsi, is_active) VALUES (5, 'Personal Care', 'Produk perawatan diri', true);
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1), true);

-- Data for products table
DELETE FROM products;
SELECT setval(pg_get_serial_sequence('products', 'id'), 1, false);
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (1, 'Roti Tawar Sari Roti', 'P001', 'Makanan', '12000.00', 50, 'Roti tawar berkualitas untuk sarapan', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (2, 'Indomie Goreng', 'P002', 'Makanan', '3500.00', 100, 'Mie instan rasa ayam bawang', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (3, 'Aqua 600ml', 'P003', 'Minuman', '3000.00', 200, 'Air mineral dalam kemasan', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (4, 'Teh Botol Sosro', 'P004', 'Minuman', '4500.00', 80, 'Teh manis dalam botol', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (5, 'Chitato Sapi Panggang', 'P005', 'Snack', '8000.00', 40, 'Keripik kentang rasa sapi panggang', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (6, 'Beras Premium 5kg', 'P006', 'Sembako', '75000.00', 25, 'Beras premium kualitas terbaik', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (7, 'Minyak Goreng Tropical 1L', 'P007', 'Sembako', '18000.00', 60, 'Minyak goreng kelapa sawit', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (8, 'Sampo Clear Men', 'P008', 'Personal Care', '22000.00', 30, 'Sampo anti ketombe untuk pria', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (9, 'Sabun Mandi Lifebuoy', 'P009', 'Personal Care', '5500.00', 70, 'Sabun mandi antibakteri', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (10, 'Susu Ultra Milk 250ml', 'P010', 'Minuman', '6500.00', 90, 'Susu UHT rasa plain', NULL, true, '2025-07-05T07:24:49.073Z');
INSERT INTO products (id, nama, kode, kategori, harga, stok, deskripsi, gambar, is_active, created_at) VALUES (11, 'ngfx', 'ggfg', 'Minuman', '36666666.00', 1, '', NULL, true, '2025-07-06T04:33:14.584Z');
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1), true);

-- Data for customers table
DELETE FROM customers;
SELECT setval(pg_get_serial_sequence('customers', 'id'), 1, false);
INSERT INTO customers (id, nama, email, telepon, alamat, total_pembelian, jumlah_transaksi, created_at) VALUES (1, 'Andi Susanto', 'andi@email.com', '08123456789', 'Jl. Sudirman No. 123, Jakarta', '0.00', 0, '2025-07-05T07:24:49.168Z');
INSERT INTO customers (id, nama, email, telepon, alamat, total_pembelian, jumlah_transaksi, created_at) VALUES (2, 'Sari Dewi', 'sari@email.com', '08198765432', 'Jl. Thamrin No. 456, Jakarta', '0.00', 0, '2025-07-05T07:24:49.168Z');
INSERT INTO customers (id, nama, email, telepon, alamat, total_pembelian, jumlah_transaksi, created_at) VALUES (3, 'Budi Hartono', 'budi@email.com', '08555123456', 'Jl. Gatot Subroto No. 789, Jakarta', '0.00', 0, '2025-07-05T07:24:49.168Z');
INSERT INTO customers (id, nama, email, telepon, alamat, total_pembelian, jumlah_transaksi, created_at) VALUES (4, 'Lisa Permata', 'lisa@email.com', '08777888999', 'Jl. Kuningan No. 321, Jakarta', '0.00', 0, '2025-07-05T07:24:49.168Z');
INSERT INTO customers (id, nama, email, telepon, alamat, total_pembelian, jumlah_transaksi, created_at) VALUES (5, 'Riko Pratama', 'riko@email.com', '08333444555', 'Jl. Senayan No. 654, Jakarta', '0.00', 0, '2025-07-05T07:24:49.168Z');
INSERT INTO customers (id, nama, email, telepon, alamat, total_pembelian, jumlah_transaksi, created_at) VALUES (6, '', 'laporsiappak@gmail.com', '', '', '0.00', 0, '2025-07-05T08:55:26.109Z');
SELECT setval(pg_get_serial_sequence('customers', 'id'), COALESCE((SELECT MAX(id) FROM customers), 1), true);

