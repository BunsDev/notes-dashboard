import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';
import * as schema from './schema';
import { drizzle as drizzlePgNode } from 'drizzle-orm/node-postgres';

// For Node.js, we need to set this to true to use fetch
neonConfig.fetchConnectionCache = true;

// For connection pooling in Node.js environments
let connectionPool: Pool | null = null;

// Create Drizzle client for serverless environments
function createDrizzleClient() {
  // Create Neon connection
  const sql = neon(process.env.DATABASE_URL!);
  // Create Drizzle ORM instance
  return drizzle(sql, { schema });
}

// Singleton instance of Drizzle client
let _db: ReturnType<typeof createDrizzleClient>;

// Get the Drizzle client (singleton)
export function getDb() {
  if (!_db) {
    _db = createDrizzleClient();
  }
  return _db;
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

// Get Node Postgres Drizzle instance (for migrations)
export function getNodeDb() {
  return drizzlePgNode(getConnectionPool(), { schema });
}

// Close the connection pool
export async function closeDbConnection() {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
}
