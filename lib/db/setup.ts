import { runMigrations } from './migrate';
import { seedCategories } from './seed';
import { closeDbConnection } from './index';

/**
 * Run database setup (migrations and seeding)
 * This is useful for initial setup or in CI/CD pipelines
 */
async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        // Run migrations first
        await runMigrations();

        // Then seed initial data
        await seedCategories();

        console.log('Database setup completed successfully!');
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    } finally {
        await closeDbConnection();
    }
}

// Only run setup directly if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('Setup process completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Unhandled error during setup:', error);
            process.exit(1);
        });
}

export { setupDatabase };
