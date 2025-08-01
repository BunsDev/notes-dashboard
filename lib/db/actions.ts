"use server";

import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from ".";
import { categories, Note, notes, users, type NewNote } from "./schema";
import { getCurrentUser } from "../api/users";
import { redirect } from "next/navigation";

// ===== NOTE OPERATIONS =====

/**
 * Get all notes with their categories for the current authenticated user
 */
export async function getNotes() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    const data = await db.query.notes.findMany({
      where: eq(notes.userId, user.id),
      with: {
        category: true,
      },
      orderBy: [
        desc(notes.isPinned), 
        desc(notes.updated)
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
 * Get a note by ID (only if the current user is the author)
 */
export async function getNoteById(id: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    // Convert string ID to number for database query
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return {
        success: false,
        error: "Invalid note ID format"
      };
    }
    
    const data = await db.query.notes.findFirst({
      where: and(
        eq(notes.id, numericId),
        eq(notes.userId, user.id)
      ),
      with: { category: true },
    });
    
    if (!data) {
      return { 
        success: false, 
        error: "Note not found or you don't have permission to access it" 
      };
    }
    
    return { 
      success: true, 
      data: data 
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
 * Create a new note for the current authenticated user
 */
export async function createNote(note: NewNote) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    await db.insert(notes).values({
      ...note,
      userId: user.id, // Ensure the current user is set as the author
      isPinned: note.isPinned ?? false,
      created: new Date(),
      updated: new Date(),
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
 * Update a note (only if the current user is the author)
 */
export async function updateNote(id: string, note: Partial<Note>) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    // Convert string ID to number for database query
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return {
        success: false,
        error: "Invalid note ID format"
      };
    }
    
    // First check if the note exists and belongs to this user
    const existingNote = await db.query.notes.findFirst({
      where: and(
        eq(notes.id, numericId),
        eq(notes.userId, user.id)
      ),
    });
    
    if (!existingNote) {
      return {
        success: false,
        error: "Note not found or you don't have permission to update it"
      };
    }
    
    await db.update(notes)
      .set({
        ...note,
        updated: new Date(),
      })
      .where(and(
        eq(notes.id, numericId),
        eq(notes.userId, user.id)
      ));
      
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
 * Delete a note (only if the current user is the author)
 */
export async function deleteNote(id: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    // Convert string ID to number for database query
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return {
        success: false,
        error: "Invalid note ID format"
      };
    }
    
    // First check if the note exists and belongs to this user
    const existingNote = await db.query.notes.findFirst({
      where: and(
        eq(notes.id, numericId),
        eq(notes.userId, user.id)
      ),
    });
    
    if (!existingNote) {
      return {
        success: false,
        error: "Note not found or you don't have permission to delete it"
      };
    }
    
    await db.delete(notes).where(
      and(
        eq(notes.id, numericId),
        eq(notes.userId, user.id)
      )
    );
    
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
 * Toggle note pin status (only if the current user is the author)
 */
export async function toggleNotePin(id: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    // Convert string ID to number for database query
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return {
        success: false,
        error: "Invalid note ID format"
      };
    }
    
    // First get the current pin status and check ownership
    const note = await db.query.notes.findFirst({
      where: and(
        eq(notes.id, numericId),
        eq(notes.userId, user.id)
      ),
      columns: { isPinned: true }
    });
    
    if (!note) {
      return { 
        success: false, 
        error: "Note not found or you don't have permission to modify it" 
      };
    }
    
    // Toggle the pin status
    await db.update(notes)
      .set({ 
        isPinned: !note.isPinned,
        updated: new Date() 
      })
      .where(and(
        eq(notes.id, numericId),
        eq(notes.userId, user.id)
      ));
      
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
 * Get notes by category (only for the current authenticated user)
 */
export async function getNotesByCategory(categoryId: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    
    // Convert string ID to number for database query
    const numericCategoryId = parseInt(categoryId, 10);
    
    if (isNaN(numericCategoryId)) {
      return {
        success: false,
        error: "Invalid category ID format"
      };
    }
    
    const data = await db.query.notes.findMany({
      where: and(
        eq(notes.categoryId, numericCategoryId),
        eq(notes.userId, user.id)
      ),
      with: { category: true },
      orderBy: [
        desc(notes.isPinned), 
        desc(notes.updated)
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
