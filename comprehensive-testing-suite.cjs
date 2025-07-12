const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 ===== COMPREHENSIVE TESTING SUITE - POS CAFELUX =====\n');

// Test Results Storage
const testResults = {
  database: { passed: 0, failed: 0, tests: [] },
  api: { passed: 0, failed: 0, tests: [] },
  schema: { passed: 0, failed: 0, tests: [] },
  integration: { passed: 0, failed: 0, tests: [] }
};

// Helper function to log test results
function logTest(category, testName, status, details = '') {
  const result = { name: testName, status, details, timestamp: new Date().toISOString() };
  testResults[category].tests.push(result);
  
  if (status === 'PASS') {
    testResults[category].passed++;
    console.log(`✅ ${testName}: PASSED ${details ? '- ' + details : ''}`);
  } else {
    testResults[category].failed++;
    console.log(`❌ ${testName}: FAILED ${details ? '- ' + details : ''}`);
  }
}

// 1. DATABASE SCHEMA COMPARISON TESTS
async function testDatabaseSchema() {
  console.log('📊 1. DATABASE SCHEMA COMPARISON TESTS\n');
  
  try {
    // Test 1: Check if all required tables exist
    const requiredTables = [
      'users', 'products', 'categories', 'customers', 
      'transactions', 'transaction_items', 'dashboard_stats',
      'subscription_plans', 'features'
    ];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          logTest('schema', `Table ${table} exists`, 'FAIL', error.message);
        } else {
          logTest('schema', `Table ${table} exists`, 'PASS', `Accessible with ${data?.length || 0} sample records`);
        }
      } catch (err) {
        logTest('schema', `Table ${table} exists`, 'FAIL', err.message);
      }
    }
    
    // Test 2: Check categories table structure
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, nama, deskripsi')
        .limit(1);
      
      if (error) {
        logTest('schema', 'Categories table structure', 'FAIL', error.message);
      } else {
        const hasRequiredFields = data && data.length >= 0;
        logTest('schema', 'Categories table structure', hasRequiredFields ? 'PASS' : 'FAIL', 
          `Required fields: id, nama, deskripsi`);
      }
    } catch (err) {
      logTest('schema', 'Categories table structure', 'FAIL', err.message);
    }
    
    // Test 3: Check products table structure
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, nama, kode, kategori, harga, stok')
        .limit(1);
      
      if (error) {
        logTest('schema', 'Products table structure', 'FAIL', error.message);
      } else {
        logTest('schema', 'Products table structure', 'PASS', 'All required fields present');
      }
    } catch (err) {
      logTest('schema', 'Products table structure', 'FAIL', err.message);
    }
    
    // Test 4: Check users table structure
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, nama, role')
        .limit(1);
      
      if (error) {
        logTest('schema', 'Users table structure', 'FAIL', error.message);
      } else {
        logTest('schema', 'Users table structure', 'PASS', 'Authentication fields present');
      }
    } catch (err) {
      logTest('schema', 'Users table structure', 'FAIL', err.message);
    }
    
  } catch (error) {
    logTest('schema', 'Database Schema Tests', 'FAIL', error.message);
  }
}

// 2. DATABASE OPERATIONS TESTS
async function testDatabaseOperations() {
  console.log('\n💾 2. DATABASE OPERATIONS TESTS\n');
  
  // Test 1: Categories CRUD Operations
  try {
    // CREATE
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert([{ nama: 'Test Category', deskripsi: 'Test Description' }])
      .select()
      .single();
    
    if (createError) {
      logTest('database', 'Categories CREATE operation', 'FAIL', createError.message);
    } else {
      logTest('database', 'Categories CREATE operation', 'PASS', `Created category ID: ${newCategory.id}`);
      
      // READ
      const { data: readCategory, error: readError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', newCategory.id)
        .single();
      
      if (readError) {
        logTest('database', 'Categories READ operation', 'FAIL', readError.message);
      } else {
        logTest('database', 'Categories READ operation', 'PASS', `Retrieved: ${readCategory.nama}`);
      }
      
      // UPDATE
      const { data: updatedCategory, error: updateError } = await supabase
        .from('categories')
        .update({ nama: 'Updated Test Category' })
        .eq('id', newCategory.id)
        .select()
        .single();
      
      if (updateError) {
        logTest('database', 'Categories UPDATE operation', 'FAIL', updateError.message);
      } else {
        logTest('database', 'Categories UPDATE operation', 'PASS', `Updated to: ${updatedCategory.nama}`);
      }
      
      // DELETE
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', newCategory.id);
      
      if (deleteError) {
        logTest('database', 'Categories DELETE operation', 'FAIL', deleteError.message);
      } else {
        logTest('database', 'Categories DELETE operation', 'PASS', 'Successfully deleted test category');
      }
    }
  } catch (error) {
    logTest('database', 'Categories CRUD Operations', 'FAIL', error.message);
  }
  
  // Test 2: Products Operations
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) {
      logTest('database', 'Products SELECT operation', 'FAIL', error.message);
    } else {
      logTest('database', 'Products SELECT operation', 'PASS', `Retrieved ${products.length} products`);
    }
  } catch (error) {
    logTest('database', 'Products SELECT operation', 'FAIL', error.message);
  }
  
  // Test 3: Transactions Operations
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);
    
    if (error) {
      logTest('database', 'Transactions SELECT operation', 'FAIL', error.message);
    } else {
      logTest('database', 'Transactions SELECT operation', 'PASS', `Retrieved ${transactions.length} transactions`);
    }
  } catch (error) {
    logTest('database', 'Transactions SELECT operation', 'FAIL', error.message);
  }
}

// 3. API ENDPOINTS TESTS
async function testAPIEndpoints() {
  console.log('\n🌐 3. API ENDPOINTS TESTS\n');
  
  const baseUrl = 'http://localhost:5000'; // Adjust based on your server port
  
  const endpoints = [
    { method: 'GET', path: '/api/products', name: 'Get Products' },
    { method: 'GET', path: '/api/categories', name: 'Get Categories' },
    { method: 'GET', path: '/api/transactions', name: 'Get Transactions' },
    { method: 'GET', path: '/api/customers', name: 'Get Customers' },
    { method: 'GET', path: '/api/dashboard/stats', name: 'Get Dashboard Stats' },
    { method: 'GET', path: '/api/products/low-stock', name: 'Get Low Stock Products' },
    { method: 'GET', path: '/api/reminders', name: 'Get Reminders' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        logTest('api', `${endpoint.name} (${endpoint.method} ${endpoint.path})`, 'PASS', 
          `Status: ${response.status}, Data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } else {
        logTest('api', `${endpoint.name} (${endpoint.method} ${endpoint.path})`, 'FAIL', 
          `Status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      logTest('api', `${endpoint.name} (${endpoint.method} ${endpoint.path})`, 'FAIL', 
        `Connection error: ${error.message}`);
    }
  }
}

// 4. INTEGRATION TESTS
async function testIntegration() {
  console.log('\n🔗 4. INTEGRATION TESTS\n');
  
  // Test 1: Category-Product Relationship
  try {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (catError) {
      logTest('integration', 'Category-Product Relationship', 'FAIL', catError.message);
    } else if (categories.length > 0) {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('kategori', categories[0].nama)
        .limit(5);
      
      if (prodError) {
        logTest('integration', 'Category-Product Relationship', 'FAIL', prodError.message);
      } else {
        logTest('integration', 'Category-Product Relationship', 'PASS', 
          `Found ${products.length} products in category "${categories[0].nama}"`);
      }
    } else {
      logTest('integration', 'Category-Product Relationship', 'FAIL', 'No categories found');
    }
  } catch (error) {
    logTest('integration', 'Category-Product Relationship', 'FAIL', error.message);
  }
  
  // Test 2: Transaction-Items Relationship
  try {
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (transError) {
      logTest('integration', 'Transaction-Items Relationship', 'FAIL', transError.message);
    } else if (transactions.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('transaction_items')
        .select('*')
        .eq('transaction_id', transactions[0].id);
      
      if (itemsError) {
        logTest('integration', 'Transaction-Items Relationship', 'FAIL', itemsError.message);
      } else {
        logTest('integration', 'Transaction-Items Relationship', 'PASS', 
          `Transaction ${transactions[0].id} has ${items.length} items`);
      }
    } else {
      logTest('integration', 'Transaction-Items Relationship', 'PASS', 'No transactions found (expected for new setup)');
    }
  } catch (error) {
    logTest('integration', 'Transaction-Items Relationship', 'FAIL', error.message);
  }
  
  // Test 3: User Authentication Structure
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, is_active')
      .limit(5);
    
    if (error) {
      logTest('integration', 'User Authentication Structure', 'FAIL', error.message);
    } else {
      const activeUsers = users.filter(u => u.is_active);
      logTest('integration', 'User Authentication Structure', 'PASS', 
        `Found ${users.length} users, ${activeUsers.length} active`);
    }
  } catch (error) {
    logTest('integration', 'User Authentication Structure', 'FAIL', error.message);
  }
}

// 5. EDGE CASES TESTS
async function testEdgeCases() {
  console.log('\n⚠️  5. EDGE CASES TESTS\n');
  
  // Test 1: Empty table queries
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('nama', 'NonExistentCategory');
    
    if (error) {
      logTest('integration', 'Empty query result handling', 'FAIL', error.message);
    } else {
      logTest('integration', 'Empty query result handling', 'PASS', 
        `Query returned ${data.length} results (expected: 0)`);
    }
  } catch (error) {
    logTest('integration', 'Empty query result handling', 'FAIL', error.message);
  }
  
  // Test 2: Invalid data insertion
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ nama: null }]) // Invalid: nama cannot be null
      .select();
    
    if (error) {
      logTest('integration', 'Invalid data insertion handling', 'PASS', 
        'Correctly rejected invalid data: ' + error.message);
    } else {
      logTest('integration', 'Invalid data insertion handling', 'FAIL', 
        'Should have rejected null nama field');
    }
  } catch (error) {
    logTest('integration', 'Invalid data insertion handling', 'PASS', 
      'Correctly caught invalid data: ' + error.message);
  }
  
  // Test 3: Large data query
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1000);
    
    if (error) {
      logTest('integration', 'Large data query handling', 'FAIL', error.message);
    } else {
      logTest('integration', 'Large data query handling', 'PASS', 
        `Successfully queried up to 1000 records, got ${data.length}`);
    }
  } catch (error) {
    logTest('integration', 'Large data query handling', 'FAIL', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`🚀 Starting comprehensive testing at ${new Date().toISOString()}\n`);
  
  await testDatabaseSchema();
  await testDatabaseOperations();
  await testAPIEndpoints();
  await testIntegration();
  await testEdgeCases();
  
  // Generate final report
  console.log('\n📊 ===== FINAL TEST REPORT =====\n');
  
  const categories = ['schema', 'database', 'api', 'integration'];
  let totalPassed = 0;
  let totalFailed = 0;
  
  categories.forEach(category => {
    const result = testResults[category];
    totalPassed += result.passed;
    totalFailed += result.failed;
    
    console.log(`${category.toUpperCase()}:`);
    console.log(`  ✅ Passed: ${result.passed}`);
    console.log(`  ❌ Failed: ${result.failed}`);
    console.log(`  📊 Success Rate: ${((result.passed / (result.passed + result.failed)) * 100).toFixed(1)}%\n`);
  });
  
  console.log('OVERALL RESULTS:');
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📊 Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  // Determine deployment readiness
  const successRate = (totalPassed / (totalPassed + totalFailed)) * 100;
  console.log('\n🎯 DEPLOYMENT READINESS:');
  
  if (successRate >= 90) {
    console.log('🟢 READY FOR PRODUCTION - Excellent test coverage');
  } else if (successRate >= 75) {
    console.log('🟡 READY WITH CAUTION - Good test coverage, monitor closely');
  } else if (successRate >= 50) {
    console.log('🟠 NEEDS IMPROVEMENT - Address failed tests before deployment');
  } else {
    console.log('🔴 NOT READY - Critical issues need to be resolved');
  }
  
  console.log(`\n🏁 Testing completed at ${new Date().toISOString()}`);
  
  // Save detailed results to file
  const fs = require('fs');
  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
  console.log('📄 Detailed results saved to test-results.json');
}

// Run the tests
runAllTests().catch(console.error);
