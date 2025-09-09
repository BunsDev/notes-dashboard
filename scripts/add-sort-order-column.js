const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function addSortOrderColumn() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Adding sort_order column to notes table...');
    
    // Add the column if it doesn't exist
    await sql`
      ALTER TABLE notes 
      ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0 NOT NULL
    `;
    
    console.log('✅ Successfully added sort_order column');
    
    // Update existing notes to have sequential sort_order values
    console.log('Setting initial sort_order values for existing notes...');
    
    await sql`
      WITH ordered_notes AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY is_pinned DESC, updated DESC) as rn
        FROM notes
      )
      UPDATE notes 
      SET sort_order = ordered_notes.rn
      FROM ordered_notes 
      WHERE notes.id = ordered_notes.id
    `;
    
    console.log('✅ Successfully set initial sort_order values');
    
  } catch (error) {
    console.error('❌ Error adding sort_order column:', error);
    process.exit(1);
  }
}

addSortOrderColumn();
