"use server";

import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./index";
import { notes, categories, users, type Note, type NewNote } from "./schema";

// ===== NOTE OPERATIONS =====

/**
 * Get all notes with their categories
 */
export async function getNotes() {
  try {
    const data = await db.query.notes.findMany({
      with: {
        category: true,
      },
      orderBy: [
        desc(notes.isPinned), 
        desc(notes.updatedAt)
      ],
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Get a note by ID
 */
export async function getNoteById(id: number) {
  try {
    const data = await db.query.notes.findFirst({
      where: eq(notes.id, id),
      with: { category: true },
    });
    return { 
      success: true, 
      data: data || null 
    };
  } catch (error) {
    console.error(`Error fetching note with ID ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Create a new note
 */
export async function createNote(note: NewNote) {
  try {
    await db.insert(notes).values({
      ...note,
      isPinned: note.isPinned ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error creating note:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Update a note
 */
export async function updateNote(id: number, note: Partial<Note>) {
  try {
    await db.update(notes)
      .set({
        ...note,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id));
      
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(`Error updating note with ID ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Delete a note
 */
export async function deleteNote(id: number) {
  try {
    await db.delete(notes).where(eq(notes.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting note with ID ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Toggle note pin status
 */
export async function toggleNotePin(id: number) {
  try {
    // First get the current pin status
    const note = await db.query.notes.findFirst({
      where: eq(notes.id, id),
      columns: { isPinned: true }
    });
    
    if (!note) {
      return { 
        success: false, 
        error: "Note not found" 
      };
    }
    
    // Toggle the pin status
    await db.update(notes)
      .set({ 
        isPinned: !note.isPinned,
        updatedAt: new Date() 
      })
      .where(eq(notes.id, id));
      
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(`Error toggling pin for note with ID ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Get notes by category
 */
export async function getNotesByCategory(categoryId: number) {
  try {
    const data = await db.query.notes.findMany({
      where: eq(notes.categoryId, categoryId),
      with: { category: true },
      orderBy: [
        desc(notes.isPinned), 
        desc(notes.updatedAt)
      ],
    });
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching notes for category ${categoryId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

// ===== CATEGORY OPERATIONS =====

/**
 * Get all categories
 */
export async function getCategories() {
  try {
    const data = await db.select().from(categories);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

// ===== USER OPERATIONS =====

/**
 * Get all users from the database
 */
export async function getUsers() {
  try {
    const data = await db.select().from(users);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string) {
  try {
    const data = await db.select().from(users).where(eq(users.id, id));
    return { 
      success: true, 
      data: data[0] || null 
    };
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
