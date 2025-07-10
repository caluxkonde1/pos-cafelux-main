import { config } from 'dotenv';
import path from 'path';

// Load production environment variables
config({ path: '.env.production' });

console.log('🚀 Starting POS CafeLux in PRODUCTION mode...');
console.log('🗄️  Using Supabase Database');
console.log(`🌐 Port: ${process.env.PORT}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV}`);

// Import and start the server
import('./server/index.ts');
