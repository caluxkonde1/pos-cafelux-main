// Start local development server without database
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting POS CafeLux Local Development Server...');
console.log('📦 Enhanced Product Management System Ready');
console.log('💎 Pro Features: Opsi Tambahan, Bundel, Bahan Baku & Resep');

// Set environment variables for development
process.env.NODE_ENV = 'development';
process.env.NODE_OPTIONS = '--no-deprecation';
process.env.USE_MOCK_DATA = 'true';

// Start the server with tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    USE_MOCK_DATA: 'true'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Error starting server:', error);
});

serverProcess.on('close', (code) => {
  console.log(`🔴 Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
