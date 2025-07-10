// Test transaction creation with correct format
const testTransaction = async () => {
  console.log("🧪 Testing Transaction Creation...\n");
  
  const transactionData = {
    transaction: {
      kasirId: 1,
      subtotal: "12000",
      pajak: "1200",
      total: "13200",
      metodePembayaran: "tunai",
      jumlahBayar: "15000",
      kembalian: "1800"
    },
    items: [
      {
        productId: 1,
        namaProduk: "Roti Tawar Sari Roti",
        harga: "8500",
        jumlah: 1,
        subtotal: "8500"
      },
      {
        productId: 3,
        namaProduk: "Indomie Goreng",
        harga: "3500",
        jumlah: 1,
        subtotal: "3500"
      }
    ]
  };

  try {
    console.log("📝 Sending transaction data:");
    console.log(JSON.stringify(transactionData, null, 2));
    
    const response = await fetch("http://localhost:5002/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });

    console.log(`\n📡 Response status: ${response.status}`);
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Transaction created successfully!");
      console.log("📋 Transaction details:");
      console.log(`- ID: ${result.id}`);
      console.log(`- Nomor: ${result.nomorTransaksi}`);
      console.log(`- Total: Rp ${parseFloat(result.total).toLocaleString()}`);
      console.log(`- Items: ${result.items.length} products`);
      console.log(`- Status: ${result.status}`);
    } else {
      console.log("❌ Transaction failed!");
      console.log("📋 Error details:");
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log("❌ Network error:");
    console.log(error.message);
  }
};

// Run the test
testTransaction();
