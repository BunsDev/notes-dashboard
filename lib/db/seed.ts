import { db } from './index';
import { categories } from './schema';

/**
 * Seed initial categories
 */
export async function seedCategories() {
  try {
    console.log('Seeding categories...');
    
    // Define initial categories
    const initialCategories = [
      {
        name: 'Technical',
        slug: 'technical',
        icon: 'Code',
        color: 'blue',
      },
      {
        name: 'Behavioral',
        slug: 'behavioral',
        icon: 'Users',
        color: 'green',
      },
      {
        name: 'Concepts',
        slug: 'concepts',
        icon: 'Lightbulb',
        color: 'purple',
      },
      {
        name: 'Tips',
        slug: 'tips',
        icon: 'Star',
        color: 'yellow',
      },
    ];

    // Insert categories one by one
    for (const category of initialCategories) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }

    console.log('Categories seeded successfully!');
    
    return { success: true };
  } catch (error) {
    console.error('Error seeding categories:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Only run seeder directly if this file is executed directly
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('Seeding process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Unhandled error during seeding:', error);
      process.exit(1);
    });
}
