import { and, desc, eq, like, sql } from 'drizzle-orm';
import { db } from '../index';
import { notes, categories } from '../schema';

/**
 * Search notes by title or content with pagination
 */
export async function searchNotes(searchTerm: string, page = 1, pageSize = 10) {
  try {
    // Calculate offset
    const offset = (page - 1) * pageSize;
    
    // Search query with pagination
    const data = await db.query.notes.findMany({
      where: and(
        like(notes.title, `%${searchTerm}%`),
        like(notes.content, `%${searchTerm}%`)
      ),
      with: {
        category: true,
      },
      orderBy: [
        desc(notes.isPinned),
        desc(notes.updated)
      ],
      limit: pageSize,
      offset: offset,
    });
    
    // Get total count for pagination
    const countResult = await db.select({
      count: sql<number>`count(*)`,
    })
    .from(notes)
    .where(
      and(
        like(notes.title, `%${searchTerm}%`),
        like(notes.content, `%${searchTerm}%`)
      )
    );
    
    const totalCount = countResult[0].count;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error(`Error searching notes:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get notes stats by category
 */
export async function getNoteStatsByCategory() {
  try {
    const stats = await db
      .select({
        categoryId: notes.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
        count: sql<number>`count(${notes.id})`,
      })
      .from(notes)
      .leftJoin(categories, eq(notes.categoryId, categories.id))
      .groupBy(notes.categoryId, categories.name, categories.slug, categories.icon, categories.color);
      
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching note stats by category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
