console.log('🧪 Testing Enhanced API Endpoints...');

const BASE_URL = 'http://localhost:5001';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data: result
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

async function runAPITests() {
  console.log('\n🔐 Testing Enhanced Authentication...');
  
  // Test 1: Enhanced Login
  const loginTest = await testAPI('/api/auth/login', 'POST', {
    username: 'admin',
    password: 'admin123'
  });
  
  if (loginTest.success) {
    console.log('✅ Enhanced login successful');
    console.log(`  👤 User: ${loginTest.data.user?.nama} (${loginTest.data.user?.role})`);
    console.log(`  🔑 Permissions: ${Object.keys(loginTest.data.permissions || {}).length} keys`);
  } else {
    console.log('❌ Enhanced login failed:', loginTest.error || loginTest.data?.message);
  }
  
  console.log('\n🏢 Testing Outlet Management...');
  
  // Test 2: Get Outlets
  const outletsTest = await testAPI('/api/outlets');
  if (outletsTest.success) {
    console.log(`✅ Outlets retrieved: ${outletsTest.data.length} outlets`);
    outletsTest.data.forEach(outlet => {
      console.log(`  🏪 ${outlet.nama} (${outlet.kodeOutlet})`);
    });
  } else {
    console.log('❌ Outlets test failed:', outletsTest.error || outletsTest.data?.message);
  }
  
  // Test 3: Create New Outlet
  const newOutletTest = await testAPI('/api/outlets', 'POST', {
    nama: 'Outlet Cabang 2',
    alamat: 'Jl. Sudirman No. 123',
    telepon: '021-87654321',
    kodeOutlet: 'OUT002'
  });
  
  if (newOutletTest.success) {
    console.log('✅ New outlet created successfully');
    console.log(`  🏪 ${newOutletTest.data.nama} (${newOutletTest.data.kodeOutlet})`);
  } else {
    console.log('❌ Create outlet failed:', newOutletTest.error || newOutletTest.data?.message);
  }
  
  console.log('\n📦 Testing Enhanced Product Features...');
  
  // Test 4: Get Low Stock Products
  const lowStockTest = await testAPI('/api/products/low-stock');
  if (lowStockTest.success) {
    console.log(`✅ Low stock products: ${lowStockTest.data.length} items`);
    if (lowStockTest.data.length > 0) {
      lowStockTest.data.forEach(product => {
        console.log(`  ⚠️ ${product.nama} - Stock: ${product.stok}/${product.stokMinimal}`);
      });
    }
  } else {
    console.log('❌ Low stock test failed:', lowStockTest.error || lowStockTest.data?.message);
  }
  
  // Test 5: Barcode Lookup
  const barcodeTest = await testAPI('/api/products/barcode/123456789');
  if (barcodeTest.success) {
    console.log('✅ Barcode lookup successful');
    console.log(`  📦 Product: ${barcodeTest.data.nama}`);
  } else {
    console.log('ℹ️ Barcode lookup (expected - no barcode set):', barcodeTest.data?.message);
  }
  
  console.log('\n💰 Testing Discount System...');
  
  // Test 6: Get Discounts
  const discountsTest = await testAPI('/api/discounts');
  if (discountsTest.success) {
    console.log(`✅ Discounts retrieved: ${discountsTest.data.length} discounts`);
    discountsTest.data.forEach(discount => {
      const value = discount.type === 'percentage' ? `${discount.value}%` : `Rp ${discount.value}`;
      console.log(`  🎯 ${discount.nama} - ${value}`);
    });
  } else {
    console.log('❌ Discounts test failed:', discountsTest.error || discountsTest.data?.message);
  }
  
  // Test 7: Apply Discount
  const applyDiscountTest = await testAPI('/api/discounts/apply', 'POST', {
    discountId: 1,
    subtotal: 75000
  });
  
  if (applyDiscountTest.success) {
    console.log('✅ Discount application successful');
    console.log(`  💰 Discount: Rp ${applyDiscountTest.data.discountAmount.toLocaleString()}`);
    console.log(`  💳 Final Total: Rp ${applyDiscountTest.data.finalTotal.toLocaleString()}`);
  } else {
    console.log('❌ Apply discount failed:', applyDiscountTest.error || applyDiscountTest.data?.message);
  }
  
  console.log('\n📊 Testing Stock Movement System...');
  
  // Test 8: Get Stock Movements
  const stockMovementsTest = await testAPI('/api/stock-movements');
  if (stockMovementsTest.success) {
    console.log(`✅ Stock movements retrieved: ${stockMovementsTest.data.length} movements`);
    if (stockMovementsTest.data.length > 0) {
      stockMovementsTest.data.slice(0, 3).forEach(movement => {
        console.log(`  📈 Product ${movement.productId} - ${movement.type}: ${movement.quantity}`);
      });
    }
  } else {
    console.log('❌ Stock movements test failed:', stockMovementsTest.error || stockMovementsTest.data?.message);
  }
  
  // Test 9: Create Stock Movement
  const createMovementTest = await testAPI('/api/stock-movements', 'POST', {
    productId: 1,
    type: 'adjustment',
    quantity: 10,
    quantityBefore: 50,
    quantityAfter: 60,
    reason: 'inventory_adjustment',
    userId: 1,
    catatan: 'Test stock adjustment'
  });
  
  if (createMovementTest.success) {
    console.log('✅ Stock movement created successfully');
    console.log(`  📈 ${createMovementTest.data.type}: ${createMovementTest.data.quantity} units`);
  } else {
    console.log('❌ Create stock movement failed:', createMovementTest.error || createMovementTest.data?.message);
  }
  
  console.log('\n📈 Testing Advanced Reports...');
  
  // Test 10: Profit Report
  const profitReportTest = await testAPI('/api/reports/profit?startDate=2024-01-01&endDate=2024-12-31');
  if (profitReportTest.success) {
    console.log('✅ Profit report generated');
    console.log(`  💰 Revenue: ${profitReportTest.data.totalRevenue || 'Rp 0'}`);
    console.log(`  📊 Profit: ${profitReportTest.data.totalProfit || 'Rp 0'}`);
  } else {
    console.log('❌ Profit report failed:', profitReportTest.error || profitReportTest.data?.message);
  }
  
  // Test 11: Stock Movement Report
  const stockReportTest = await testAPI('/api/reports/stock-movements?startDate=2024-01-01&endDate=2024-12-31');
  if (stockReportTest.success) {
    console.log('✅ Stock movement report generated');
    console.log(`  📦 Total movements: ${stockReportTest.data.totalMovements || 0}`);
    console.log(`  📈 Stock in: ${stockReportTest.data.stockIn || 0}`);
    console.log(`  📉 Stock out: ${stockReportTest.data.stockOut || 0}`);
  } else {
    console.log('❌ Stock report failed:', stockReportTest.error || stockReportTest.data?.message);
  }
  
  console.log('\n🖨️ Testing Printer System...');
  
  // Test 12: Get Printer Settings
  const printerTest = await testAPI('/api/printer-settings');
  if (printerTest.success) {
    console.log(`✅ Printer settings retrieved: ${printerTest.data.length} printers`);
    printerTest.data.forEach(printer => {
      console.log(`  🖨️ ${printer.printerName} (${printer.printerType}) - ${printer.paperSize}`);
    });
  } else {
    console.log('❌ Printer settings failed:', printerTest.error || printerTest.data?.message);
  }
  
  console.log('\n💾 Testing Backup System...');
  
  // Test 13: Get Backup Logs
  const backupLogsTest = await testAPI('/api/backup/logs');
  if (backupLogsTest.success) {
    console.log(`✅ Backup logs retrieved: ${backupLogsTest.data.length} logs`);
    if (backupLogsTest.data.length > 0) {
      backupLogsTest.data.slice(0, 3).forEach(log => {
        console.log(`  💾 ${log.type} - ${log.status} - ${log.createdAt}`);
      });
    }
  } else {
    console.log('❌ Backup logs failed:', backupLogsTest.error || backupLogsTest.data?.message);
  }
  
  // Test 14: Create Manual Backup
  const createBackupTest = await testAPI('/api/backup/create', 'POST', {
    type: 'manual',
    userId: 1
  });
  
  if (createBackupTest.success) {
    console.log('✅ Manual backup created successfully');
    console.log(`  💾 Status: ${createBackupTest.data.status}`);
    console.log(`  📁 File: ${createBackupTest.data.filePath}`);
  } else {
    console.log('❌ Create backup failed:', createBackupTest.error || createBackupTest.data?.message);
  }
  
  console.log('\n🎉 Enhanced API Testing Complete!');
}

runAPITests().catch(console.error);
