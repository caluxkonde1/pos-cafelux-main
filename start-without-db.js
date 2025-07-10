// Temporarily remove DATABASE_URL to test with MemStorage
delete process.env.DATABASE_URL;

// Set port
process.env.PORT = '5001';
process.env.NODE_ENV = 'development';

console.log('🚀 Starting POS CafeLux without database connection...');
console.log('📦 Using MemStorage for testing');

// Import and start the server
import('./server/index.ts');
