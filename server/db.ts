import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Only initialize database connection if DATABASE_URL is provided and not empty
let pool: Pool | null = null;
let db: any = null;

// Check if we should skip database connection
const skipDatabase = process.env.SKIP_DATABASE === 'true';
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!skipDatabase && databaseUrl && databaseUrl.length > 0) {
  console.log("Connecting to Supabase database...");
  try {
    pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    db = drizzle(pool, { schema });
    console.log("Database connection initialized");
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
