-- POS CafeLux Database Functions
-- This migration adds useful database functions for the POS system

-- Function to update product stock after sale
CREATE OR REPLACE FUNCTION update_product_stock(product_id INTEGER, quantity_sold INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stok = stok - quantity_sold 
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily sales
CREATE OR REPLACE FUNCTION calculate_daily_sales(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  total_sales DECIMAL(12,2),
  total_transactions INTEGER,
  total_items_sold INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(t.total), 0) as total_sales,
    COUNT(t.id)::INTEGER as total_transactions,
    COALESCE(SUM(ti.jumlah), 0)::INTEGER as total_items_sold
  FROM transactions t
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  WHERE DATE(t.created_at) = target_date
    AND t.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_products(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  product_id INTEGER,
  product_name TEXT,
  total_sold INTEGER,
  total_revenue DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.nama as product_name,
    COALESCE(SUM(ti.jumlah), 0)::INTEGER as total_sold,
    COALESCE(SUM(ti.subtotal), 0) as total_revenue
  FROM products p
  LEFT JOIN transaction_items ti ON p.id = ti.product_id
  LEFT JOIN transactions t ON ti.transaction_id = t.id
  WHERE t.status = 'completed' OR t.status IS NULL
  GROUP BY p.id, p.nama
  ORDER BY total_sold DESC, total_revenue DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
  transaction_number TEXT;
BEGIN
  transaction_number := 'T' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  RETURN transaction_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats(customer_id INTEGER, transaction_total DECIMAL(12,2))
RETURNS VOID AS $$
BEGIN
  UPDATE customers 
  SET 
    total_pembelian = total_pembelian + transaction_total,
    jumlah_transaksi = jumlah_transaksi + 1
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE(
  product_id INTEGER,
  product_name TEXT,
  current_stock INTEGER,
  product_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.nama as product_name,
    p.stok as current_stock,
    p.kode as product_code
  FROM products p
  WHERE p.stok <= threshold
    AND p.is_active = true
  ORDER BY p.stok ASC, p.nama;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales report by date range
CREATE OR REPLACE FUNCTION get_sales_report(start_date DATE, end_date DATE)
RETURNS TABLE(
  transaction_date DATE,
  daily_sales DECIMAL(12,2),
  transaction_count INTEGER,
  items_sold INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(t.created_at) as transaction_date,
    SUM(t.total) as daily_sales,
    COUNT(t.id)::INTEGER as transaction_count,
    SUM(ti.jumlah)::INTEGER as items_sold
  FROM transactions t
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  WHERE DATE(t.created_at) BETWEEN start_date AND end_date
    AND t.status = 'completed'
  GROUP BY DATE(t.created_at)
  ORDER BY transaction_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update dashboard stats
CREATE OR REPLACE FUNCTION update_dashboard_stats_trigger()
RETURNS TRIGGER AS $$
DECLARE
  transaction_date DATE;
  daily_sales DECIMAL(12,2);
  transaction_count INTEGER;
  items_sold INTEGER;
BEGIN
  -- Get the transaction date
  transaction_date := DATE(NEW.created_at);
  
  -- Calculate stats for the day
  SELECT * INTO daily_sales, transaction_count, items_sold
  FROM calculate_daily_sales(transaction_date);
  
  -- Insert or update dashboard stats
  INSERT INTO dashboard_stats (tanggal, penjualan_harian, total_transaksi, produk_terjual, pelanggan_baru)
  VALUES (transaction_date, daily_sales, transaction_count, items_sold, 0)
  ON CONFLICT (tanggal) 
  DO UPDATE SET 
    penjualan_harian = EXCLUDED.penjualan_harian,
    total_transaksi = EXCLUDED.total_transaksi,
    produk_terjual = EXCLUDED.produk_terjual;
  
  -- Update customer stats if customer_id is provided
  IF NEW.customer_id IS NOT NULL THEN
    PERFORM update_customer_stats(NEW.customer_id, NEW.total);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic dashboard stats update
DROP TRIGGER IF EXISTS transaction_stats_trigger ON transactions;
CREATE TRIGGER transaction_stats_trigger
  AFTER INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_dashboard_stats_trigger();

-- Add unique constraint to dashboard_stats for date
ALTER TABLE dashboard_stats ADD CONSTRAINT unique_dashboard_date UNIQUE (tanggal);

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_product_stock(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_daily_sales(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_products(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_transaction_number() TO authenticated;
GRANT EXECUTE ON FUNCTION update_customer_stats(INTEGER, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_products(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_report(DATE, DATE) TO authenticated;

-- Success message
SELECT 'POS CafeLux database functions created successfully!' as status;
