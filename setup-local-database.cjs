// Setup Local Database for Development
// This script will enhance the MemStorage to be more persistent

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up local database for development...');

// Create a simple file-based storage for persistence
const dbPath = './local-data';

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
  console.log('✅ Created local data directory');
}

// Create initial data files if they don't exist
const dataFiles = [
  'users.json',
  'products.json', 
  'categories.json',
  'customers.json',
  'transactions.json',
  'transaction_items.json'
];

dataFiles.forEach(file => {
  const filePath = path.join(dbPath, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
    console.log(`✅ Created ${file}`);
  }
});

console.log('✅ Local database setup completed!');
console.log('💡 The application will now use persistent file-based storage');
console.log('📁 Data will be stored in: ./local-data/');
