// 🚀 POS CafeLux - Niagahoster Database Adapter
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../shared/schema.js';

let connection;
let db;

export async function initializeDatabase() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

    // Parse database URL
    const url = new URL(dbUrl);
    
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      } : false,
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    };

    console.log('🔗 Connecting to Niagahoster MySQL database...');
    
    connection = mysql.createPool(config);
    db = drizzle(connection, { schema, mode: 'default' });
    
    // Test connection
    await connection.execute('SELECT 1');
    console.log('✅ Connected to Niagahoster database successfully!');
    
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to Niagahoster database:', error.message);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export async function closeDatabase() {
  if (connection) {
    await connection.end();
    console.log('🔌 Database connection closed');
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    if (!connection) {
      return { status: 'disconnected', message: 'No database connection' };
    }
    
    await connection.execute('SELECT 1');
    return { status: 'healthy', message: 'Database connection is healthy' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export { db, connection };
