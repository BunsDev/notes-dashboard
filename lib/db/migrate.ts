import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as path from "path";
import { getConnectionPool, closeDbConnection } from "./index";

/**
 * Run database migrations
 * This function applies all pending migrations from the migrations folder
 */
async function runMigrations() {
  console.log("Starting database migration...");
  
  try {
    // Get the connection pool from our singleton
    const pool = getConnectionPool();
    const db = drizzle(pool);
    
    console.log("Connected to database, applying migrations...");
    
    // Resolve the absolute path to migrations folder
    const migrationsFolder = path.resolve(process.cwd(), "lib/db/migrations");
    console.log(`Using migrations from: ${migrationsFolder}`);
    
    // Apply migrations
    await migrate(db, { migrationsFolder });
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed!");
    console.error(error);
    process.exit(1);
  } finally {
    // Always close the connection pool when done
    await closeDbConnection();
  }
}

// Only run migrations directly if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Migration process completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Unhandled error during migration:", error);
      process.exit(1);
    });
}

// Export for programmatic usage
export { runMigrations };