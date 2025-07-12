const fetch = require('node-fetch');

console.log('🧪 ===== API ENDPOINTS TESTING =====\n');

const baseUrl = 'http://localhost:5001';

const endpoints = [
  { method: 'GET', path: '/api/products', name: 'Get Products' },
  { method: 'GET', path: '/api/categories', name: 'Get Categories' },
  { method: 'GET', path: '/api/transactions', name: 'Get Transactions' },
  { method: 'GET', path: '/api/customers', name: 'Get Customers' },
  { method: 'GET', path: '/api/dashboard/stats', name: 'Get Dashboard Stats' },
  { method: 'GET', path: '/api/products/low-stock', name: 'Get Low Stock Products' },
  { method: 'GET', path: '/api/reminders', name: 'Get Reminders' },
  { method: 'POST', path: '/api/categories', name: 'Create Category', body: { nama: 'Test Category', deskripsi: 'Test Description' } },
];

async function testEndpoint(endpoint) {
  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint.path}`, options);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint.name}: PASSED - Status: ${response.status}, Data: ${Array.isArray(data) ? data.length + ' items' : typeof data}`);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ ${endpoint.name}: FAILED - Status: ${response.status}, Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: FAILED - Connection error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllEndpoints() {
  console.log(`🚀 Testing API endpoints at ${baseUrl}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  console.log('\n📊 API TESTING RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (passed > failed) {
    console.log('🟢 API ENDPOINTS: MOSTLY WORKING');
  } else {
    console.log('🟡 API ENDPOINTS: NEEDS ATTENTION');
  }
}

testAllEndpoints().catch(console.error);
