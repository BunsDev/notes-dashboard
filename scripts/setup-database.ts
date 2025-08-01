import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Neon database connection details from the newly created project
const neonConfig = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_SSL: 'true',

    // Neon Auth credentials
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
};

// Path to .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');

// Create or update .env.local with the new configuration
function updateEnvFile() {
    console.log('Updating environment variables...');

    let envContent = '';

    // Add each config key-value pair to the env content
    Object.entries(neonConfig).forEach(([key, value]) => {
        envContent += `${key}=${value}\n`;
    });

    // Write to .env.local
    fs.writeFileSync(envLocalPath, envContent);
    console.log('.env.local file has been updated with Neon database and Auth configuration');
}

// Run database migrations
function runMigrations() {
    console.log('Running database migrations...');
    try {
        execSync('npx tsx lib/db/migrate.ts', { stdio: 'inherit' });
        console.log('Migrations completed successfully!');
    } catch (error) {
        console.error('Failed to run migrations:', error);
        process.exit(1);
    }
}

// Main function
async function main() {
    updateEnvFile();
    runMigrations();
    console.log('Database setup complete!');
}

main().catch(console.error);
