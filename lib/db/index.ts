import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';
import * as schema from './schema';

// For Node.js, we need to set this to true to use fetch
neonConfig.fetchConnectionCache = true;

// For direct HTTP connection (serverless)
let db: ReturnType<typeof createDrizzleClient>;

// For connection pooling in Node.js environments
let connectionPool: Pool | null = null;

// Create Drizzle client for serverless environments
function createDrizzleClient() {
  // Create Neon connection
  const sql = neon(process.env.DATABASE_URL!);
  // Create Drizzle ORM instance
  return drizzle(sql, { schema });
}

// Get the Drizzle client (singleton)
export function getDb() {
  if (!db) {
    db = createDrizzleClient();
  }
  return db;
}

// Export the db instance directly
export { schema };
export const db = getDb();

// Node.js connection pooling (for migrations and batch operations)
export function getConnectionPool() {
  if (!connectionPool) {
    connectionPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return connectionPool;
}

// Close the connection pool
export async function closeDbConnection() {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
}
