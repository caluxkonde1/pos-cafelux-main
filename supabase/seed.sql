-- POS CafeLux Seed Data
-- This file contains sample data for development and testing

-- Insert sample transaction for testing
INSERT INTO transactions (nomor_transaksi, kasir_id, subtotal, pajak, diskon, total, metode_pembayaran, status, created_at) VALUES
('T' || extract(epoch from now())::bigint, 1, 5500, 0, 0, 5500, 'tunai', 'completed', NOW());

-- Get the transaction ID for transaction items
WITH latest_transaction AS (
  SELECT id FROM transactions ORDER BY created_at DESC LIMIT 1
)
INSERT INTO transaction_items (transaction_id, product_id, nama_produk, harga, jumlah, subtotal)
SELECT 
  lt.id,
  4,
  'Teh Botol Sosro',
  5000,
  1,
  5000
FROM latest_transaction lt
UNION ALL
SELECT 
  lt.id,
  1,
  'Roti Tawar Sari Roti',
  500,
  1,
  500
FROM latest_transaction lt;

-- Insert dashboard stats for today
INSERT INTO dashboard_stats (tanggal, penjualan_harian, total_transaksi, produk_terjual, pelanggan_baru) VALUES
(CURRENT_DATE, 5500, 1, 2, 0);

-- Update product stock after transaction
UPDATE products SET stok = stok - 1 WHERE id = 4; -- Teh Botol Sosro
UPDATE products SET stok = stok - 1 WHERE id = 1; -- Roti Tawar

-- Success message
SELECT 'POS CafeLux seed data inserted successfully!' as status;
