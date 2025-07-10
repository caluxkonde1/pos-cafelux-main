import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

// Enhanced database configuration for Supabase
export class SupabaseDatabase {
  private pool: Pool | null = null;
  private supabase: any = null;
  private isConnected = false;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const databaseUrl = process.env.DATABASE_URL;
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!databaseUrl) {
        console.log('⚠️  No DATABASE_URL found, using MemStorage fallback');
        return;
      }

      // Initialize PostgreSQL connection pool
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ Supabase database connected successfully');
      this.isConnected = true;

      // Initialize Supabase client for real-time features
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client initialized');
      }

    } catch (error) {
      console.error('❌ Supabase connection failed:', error instanceof Error ? error.message : String(error));
      console.log('🔄 Falling back to MemStorage...');
      this.isConnected = false;
    }
  }

  // Get database connection
  async getConnection() {
    if (!this.isConnected || !this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool.connect();
  }

  // Execute query with automatic connection management
  async query(text: string, params?: any[]) {
    if (!this.isConnected || !this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Get Supabase client for real-time features
  getSupabaseClient() {
    return this.supabase;
  }

  // Check if connected to Supabase
  isSupabaseConnected() {
    return this.isConnected;
  }

  // Close all connections
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 Database connections closed');
    }
  }
}

// Create singleton instance
export const supabaseDb = new SupabaseDatabase();

// Enhanced query functions with fallback
export async function executeQuery(query: string, params?: any[]) {
  try {
    if (supabaseDb.isSupabaseConnected()) {
      return await supabaseDb.query(query, params);
    } else {
      // Fallback to MemStorage or throw error
      throw new Error('No database connection available');
    }
  } catch (error) {
    console.error('Query execution failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Real-time subscription helper
export function subscribeToTable(tableName: string, callback: (payload: any) => void) {
  const supabase = supabaseDb.getSupabaseClient();
  if (!supabase) {
    console.log(`⚠️  Real-time subscription not available for ${tableName}`);
    return null;
  }

  return supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: tableName }, 
      callback
    )
    .subscribe();
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    if (supabaseDb.isSupabaseConnected()) {
      const result = await supabaseDb.query('SELECT NOW() as server_time, version() as version');
      return {
        status: 'healthy',
        type: 'supabase',
        serverTime: result.rows[0].server_time,
        version: result.rows[0].version,
        connected: true
      };
    } else {
      return {
        status: 'fallback',
        type: 'memstorage',
        connected: false,
        message: 'Using in-memory storage'
      };
    }
  } catch (error) {
    return {
      status: 'error',
      type: 'unknown',
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Migration helper
export async function runMigration(migrationSql: string) {
  try {
    if (!supabaseDb.isSupabaseConnected()) {
      throw new Error('Supabase not connected - cannot run migration');
    }

    await supabaseDb.query(migrationSql);
    console.log('✅ Migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await supabaseDb.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await supabaseDb.close();
  process.exit(0);
});
