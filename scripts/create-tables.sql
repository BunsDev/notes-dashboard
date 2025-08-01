-- Create category_enum type if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_enum') THEN 
        CREATE TYPE category_enum AS ENUM ('technical', 'behavioral', 'about', 'concepts', 'tips');
    END IF;
END $$;

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create users table (will integrate with Neon Auth)
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

-- Add sample categories if the table is empty
INSERT INTO categories (name, slug, icon, color)
SELECT 'Technical', 'technical', 'Code', '#0ea5e9'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'technical');

INSERT INTO categories (name, slug, icon, color)
SELECT 'Behavioral', 'behavioral', 'Users', '#8b5cf6'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'behavioral');

INSERT INTO categories (name, slug, icon, color)
SELECT 'About', 'about', 'FileText', '#f59e0b'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'about');

INSERT INTO categories (name, slug, icon, color)
SELECT 'Concepts', 'concepts', 'BookOpen', '#10b981'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'concepts');

INSERT INTO categories (name, slug, icon, color)
SELECT 'Tips', 'tips', 'Lightbulb', '#ec4899'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tips');
