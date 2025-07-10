import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: '.env.test2' });

console.log('🚀 Starting POS CafeLux in test mode (Port 5002)...');
console.log('📦 Using MemStorage (database disabled)');
console.log(`🌐 Port: ${process.env.PORT}`);
console.log(`🔧 Skip Database: ${process.env.SKIP_DATABASE}`);

// Import and start the server
import('./server/index.ts');
