import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: '.env.test' });

console.log('🚀 Starting POS CafeLux in test mode...');
console.log('📦 Using MemStorage (database disabled)');
console.log(`🌐 Port: ${process.env.PORT}`);
console.log(`🔧 Skip Database: ${process.env.SKIP_DATABASE}`);

// Import and start the server
import('./server/index.ts');
