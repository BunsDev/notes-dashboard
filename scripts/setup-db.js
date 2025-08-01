// Script to create database tables directly with Neon PostgreSQL
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// Neon database connection details
const config = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
};

async function setupDatabase() {
  const client = new Client(config);
  
  try {
    // Connect to the database
    console.log('Connecting to Neon PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');
    
    // Read the SQL script
    const sqlPath = path.join(__dirname, 'create-tables.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL commands
    console.log('Creating database tables...');
    await client.query(sqlScript);
    console.log('Database tables created successfully!');
    
    // Create a sample user for testing (optional)
    const userId = 'test-user-' + Date.now();
    console.log('Creating sample user for testing...');
    await client.query(`
      INSERT INTO users (id, name, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [userId, 'Test User', 'test@example.com']);
    
    console.log('Database setup complete!');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    // Close the connection
    await client.end();
  }
}

setupDatabase().catch(console.error);
