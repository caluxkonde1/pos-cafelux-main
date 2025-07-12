import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Database connection variables
let pool: Pool | null = null;
let db: any = null;

// Check if we should skip database connection
const skipDatabase = process.env.SKIP_DATABASE === 'true';
const databaseUrl = process.env.DATABASE_URL?.trim();

// For local development, let's use a simple local PostgreSQL setup
// You can set DATABASE_URL to a local PostgreSQL instance
const useLocalDatabase = process.env.USE_LOCAL_DB === 'true';

async function initializeDatabase() {
  if (!skipDatabase && (databaseUrl || useLocalDatabase)) {
    try {
      const connectionString = databaseUrl || 'postgresql://postgres:password@localhost:5432/pos_cafelux';
      
      console.log("🔗 Connecting to PostgreSQL database...");
      
      // Create PostgreSQL connection pool
      pool = new Pool({ 
        connectionString,
        ssl: databaseUrl ? {
          rejectUnauthorized: false
        } : false, // No SSL for local development
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Initialize Drizzle ORM with PostgreSQL
      db = drizzle(pool, { schema });
      
      console.log("✅ PostgreSQL database connection initialized successfully");
      
      // Test the connection
      pool.query('SELECT NOW()', (err, result) => {
        if (err) {
          console.error("❌ Database connection test failed:", err.message);
          console.log("⚠️ Falling back to MemStorage");
          pool = null;
          db = null;
        } else {
          console.log("✅ Database connection test successful:", result.rows[0].now);
        }
      });
      
    } catch (error) {
      console.error("❌ Failed to initialize PostgreSQL database connection:", error instanceof Error ? error.message : String(error));
      console.log("⚠️ Falling back to MemStorage");
      pool = null;
      db = null;
    }
  } else {
    if (skipDatabase) {
      console.log("📦 Database connection skipped (SKIP_DATABASE=true), using MemStorage");
    } else {
      console.log("⚠️ DATABASE_URL not provided, using MemStorage instead");
      console.log("💡 Set DATABASE_URL or USE_LOCAL_DB=true for database connection");
      console.log("💡 For local development: USE_LOCAL_DB=true (requires local PostgreSQL)");
    }
  }
}

// Initialize database connection
initializeDatabase();

// Export database connection
export { pool, db };

// Helper function to check if database is connected
export function isDatabaseConnected(): boolean {
  return db !== null && pool !== null;
}

// Helper function to get database status
export function getDatabaseStatus(): string {
  if (isDatabaseConnected()) {
    return "Connected to PostgreSQL";
  } else if (skipDatabase) {
    return "Database connection skipped";
  } else {
    return "Using MemStorage (fallback)";
  }
}
