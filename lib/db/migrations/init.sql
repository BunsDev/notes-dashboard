-- Create category_enum type
CREATE TYPE category_enum AS ENUM ('technical', 'behavioral', 'about', 'concepts', 'tips');

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create users table (will be integrated with Neon Auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created TIMESTAMP NOT NULL DEFAULT NOW(),
  updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create notes table with reference to users
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  urls TEXT[],
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created TIMESTAMP NOT NULL DEFAULT NOW(),
  updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add some sample categories for initial setup
INSERT INTO categories (name, slug, icon, color) VALUES 
  ('Technical', 'technical', 'Code', '#0ea5e9'),
  ('Behavioral', 'behavioral', 'Users', '#8b5cf6'),
  ('About', 'about', 'FileText', '#f59e0b'),
  ('Concepts', 'concepts', 'BookOpen', '#10b981'),
  ('Tips', 'tips', 'Lightbulb', '#ec4899');
