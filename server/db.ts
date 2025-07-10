import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Database connection variables
let pool: Pool | mysql.Pool | null = null;
let db: any = null;

// Check if we should skip database connection
const skipDatabase = process.env.SKIP_DATABASE === 'true';
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!skipDatabase && databaseUrl && databaseUrl.length > 0) {
  try {
    // Detect database type from URL
    if (databaseUrl.startsWith('mysql://')) {
      console.log("Connecting to MySQL database (Niagahoster)...");
      
      // Parse MySQL URL
      const url = new URL(databaseUrl);
      const mysqlConfig: mysql.PoolOptions = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        } : undefined,
        connectionLimit: 10,
      };
      
      pool = mysql.createPool(mysqlConfig);
      db = drizzleMysql(pool, { schema, mode: 'default' });
      console.log("MySQL database connection initialized");
      
    } else if (databaseUrl.startsWith('postgresql://')) {
      console.log("Connecting to PostgreSQL database (Supabase)...");
      
      pool = new Pool({ 
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });
      db = drizzlePg(pool, { schema });
      console.log("PostgreSQL database connection initialized");
      
    } else {
      throw new Error("Unsupported database URL format. Use mysql:// or postgresql://");
    }
    
  } catch (error) {
    console.log("Failed to initialize database connection:", error instanceof Error ? error.message : String(error));
    console.log("Falling back to MemStorage");
    pool = null;
    db = null;
  }
} else {
  if (skipDatabase) {
    console.log("Database connection skipped (SKIP_DATABASE=true), using MemStorage");
  } else {
    console.log("DATABASE_URL not provided, using MemStorage instead");
  }
}

export { pool, db };
