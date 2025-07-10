import { Pool } from 'pg';

const connectionString = 'postgresql://postgres.wbseybltsgfstwqqnzxg:Caluxkonde87253186@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🧪 Testing Enhanced POS CafeLux Features...');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testEnhancedFeatures() {
  try {
    console.log('\n📡 Connecting to Supabase...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Test 1: Enhanced User Roles and Permissions
    console.log('\n🔐 Testing Enhanced User Authentication...');
    
    // Check if users have new role fields
    const usersResult = await client.query(`
      SELECT id, username, role, permissions, outlet_id, last_login 
      FROM users 
      LIMIT 3
    `);
    console.log(`✅ Users with enhanced roles: ${usersResult.rows.length}`);
    usersResult.rows.forEach(user => {
      console.log(`  👤 ${user.username} - Role: ${user.role} - Outlet: ${user.outlet_id || 'All'}`);
    });
    
    // Test 2: Outlets Management
    console.log('\n🏢 Testing Multi-Outlet System...');
    const outletsResult = await client.query('SELECT * FROM outlets WHERE is_active = true');
    console.log(`✅ Active outlets: ${outletsResult.rows.length}`);
    outletsResult.rows.forEach(outlet => {
      console.log(`  🏪 ${outlet.nama} (${outlet.kode_outlet}) - ${outlet.alamat}`);
    });
    
    // Test 3: Enhanced Products with Barcode and Stock Management
    console.log('\n📦 Testing Enhanced Product Management...');
    const productsResult = await client.query(`
      SELECT id, nama, kode, barcode, kategori_id, harga, harga_beli, 
             stok, stok_minimal, satuan, pajak, diskon_maksimal
      FROM products 
      WHERE is_active = true 
      LIMIT 5
    `);
    console.log(`✅ Enhanced products: ${productsResult.rows.length}`);
    productsResult.rows.forEach(product => {
      const profit = product.harga_beli ? 
        ((parseFloat(product.harga) - parseFloat(product.harga_beli || 0)) / parseFloat(product.harga) * 100).toFixed(1) : 'N/A';
      const stockStatus = product.stok <= product.stok_minimal ? '⚠️ LOW' : '✅ OK';
      console.log(`  📦 ${product.nama} - Stock: ${product.stok}/${product.stok_minimal} ${stockStatus} - Profit: ${profit}%`);
    });
    
    // Test 4: Stock Movements Tracking
    console.log('\n📊 Testing Stock Movement System...');
    const stockMovementsResult = await client.query(`
      SELECT sm.*, p.nama as product_name 
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
      LIMIT 5
    `);
    console.log(`✅ Stock movements recorded: ${stockMovementsResult.rows.length}`);
    if (stockMovementsResult.rows.length > 0) {
      stockMovementsResult.rows.forEach(movement => {
        console.log(`  📈 ${movement.product_name} - ${movement.type}: ${movement.quantity} (${movement.quantity_before} → ${movement.quantity_after})`);
      });
    } else {
      console.log('  ℹ️ No stock movements yet (will be created automatically on stock changes)');
    }
    
    // Test 5: Discounts System
    console.log('\n💰 Testing Discount Management...');
    const discountsResult = await client.query('SELECT * FROM discounts WHERE is_active = true');
    console.log(`✅ Active discounts: ${discountsResult.rows.length}`);
    discountsResult.rows.forEach(discount => {
      const discountText = discount.type === 'percentage' ? 
        `${discount.value}%` : `Rp ${parseFloat(discount.value).toLocaleString()}`;
      console.log(`  🎯 ${discount.nama} - ${discountText} (Min: Rp ${parseFloat(discount.min_purchase).toLocaleString()})`);
    });
    
    // Test 6: Enhanced Transactions
    console.log('\n💳 Testing Enhanced Transaction Features...');
    const transactionsResult = await client.query(`
      SELECT id, nomor_transaksi, subtotal, pajak, diskon, diskon_persen, 
             total, metode_pembayaran, jumlah_bayar, kembalian, is_printed
      FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    console.log(`✅ Enhanced transactions: ${transactionsResult.rows.length}`);
    transactionsResult.rows.forEach(transaction => {
      console.log(`  🧾 ${transaction.nomor_transaksi} - ${transaction.metode_pembayaran} - Rp ${parseFloat(transaction.total).toLocaleString()} - Printed: ${transaction.is_printed ? '✅' : '❌'}`);
    });
    
    // Test 7: Printer Settings
    console.log('\n🖨️ Testing Printer Configuration...');
    const printerResult = await client.query('SELECT * FROM printer_settings WHERE is_active = true');
    console.log(`✅ Printer configurations: ${printerResult.rows.length}`);
    printerResult.rows.forEach(printer => {
      console.log(`  🖨️ ${printer.printer_name} (${printer.printer_type}) - ${printer.paper_size} - Default: ${printer.is_default ? '✅' : '❌'}`);
    });
    
    // Test 8: Backup System
    console.log('\n💾 Testing Backup System...');
    const backupResult = await client.query('SELECT * FROM backup_logs ORDER BY created_at DESC LIMIT 3');
    console.log(`✅ Backup logs: ${backupResult.rows.length}`);
    backupResult.rows.forEach(backup => {
      const sizeKB = backup.file_size ? (backup.file_size / 1024).toFixed(1) : 'N/A';
      console.log(`  💾 ${backup.type} backup - ${backup.status} - ${sizeKB}KB - ${backup.created_at.toLocaleString()}`);
    });
    
    // Test 9: Database Performance and Indexes
    console.log('\n⚡ Testing Database Performance...');
    const indexResult = await client.query(`
      SELECT schemaname, tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename
    `);
    console.log(`✅ Performance indexes: ${indexResult.rows.length}`);
    
    // Test 10: Data Integrity and Relationships
    console.log('\n🔗 Testing Data Relationships...');
    const relationshipTest = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE kategori_id IS NOT NULL) as products_with_categories,
        (SELECT COUNT(*) FROM transactions WHERE kasir_id IS NOT NULL) as transactions_with_users,
        (SELECT COUNT(*) FROM transaction_items WHERE transaction_id IS NOT NULL) as items_with_transactions
    `);
    const rel = relationshipTest.rows[0];
    console.log(`✅ Products with categories: ${rel.products_with_categories}`);
    console.log(`✅ Transactions with users: ${rel.transactions_with_users}`);
    console.log(`✅ Transaction items linked: ${rel.items_with_transactions}`);
    
    client.release();
    console.log('\n🎉 Enhanced Features Database Testing Complete!');
    
  } catch (error) {
    console.error('\n❌ Enhanced Features Test Failed:');
    console.error('Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
  } finally {
    await pool.end();
  }
}

testEnhancedFeatures();
