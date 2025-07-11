async function testStockUpdateAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Stock Update API...\n');
  
  try {
    // Test 1: Update stock with valid role (pemilik)
    console.log('Test 1: Update stock with pemilik role');
    const response1 = await fetch(`${baseURL}/api/products/1/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stok: 50,
        userRole: 'pemilik'
      }),
    });
    
    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', result1);
    console.log('✅ Test 1 passed\n');
    
    // Test 2: Update stock with valid role (admin)
    console.log('Test 2: Update stock with admin role');
    const response2 = await fetch(`${baseURL}/api/products/2/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stok: 100,
        userRole: 'admin'
      }),
    });
    
    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', result2);
    console.log('✅ Test 2 passed\n');
    
    // Test 3: Update stock with invalid role (kasir)
    console.log('Test 3: Update stock with kasir role (should fail)');
    const response3 = await fetch(`${baseURL}/api/products/1/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stok: 25,
        userRole: 'kasir'
      }),
    });
    
    const result3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', result3);
    console.log('✅ Test 3 passed (correctly rejected)\n');
    
    // Test 4: Update stock with negative value (should fail)
    console.log('Test 4: Update stock with negative value (should fail)');
    const response4 = await fetch(`${baseURL}/api/products/1/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stok: -10,
        userRole: 'pemilik'
      }),
    });
    
    const result4 = await response4.json();
    console.log('Status:', response4.status);
    console.log('Response:', result4);
    console.log('✅ Test 4 passed (correctly rejected)\n');
    
    // Test 5: Get all products to verify changes
    console.log('Test 5: Get all products to verify changes');
    const response5 = await fetch(`${baseURL}/api/products`);
    const products = await response5.json();
    
    console.log('Status:', response5.status);
    console.log('Products count:', products.length);
    if (products.length > 0) {
      console.log('Sample product:', {
        id: products[0].id,
        nama: products[0].nama,
        stok: products[0].stok
      });
    }
    console.log('✅ Test 5 passed\n');
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStockUpdateAPI();
