import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { stackServerApp } from "@/app/stack";

/**
 * Syncs the authenticated user from Stack Auth to the local database
 * This ensures any user that logs in via Stack Auth is also in our users table
 */
export async function syncUserWithDatabase() {
  try {
    // Get the current authenticated user from Stack Auth
    const user = await stackServerApp.getUser();
    
    // If no user is authenticated, we don't need to do anything
    if (!user) return null;
    
    // Check if user already exists in our database
    const existingUsers = await db.select()
      .from(users)
      .where(sql`${users.id} = ${user.id}`)
      .limit(1);
    
    const existingUser = existingUsers[0];
    
    if (existingUser) {
      // User exists, update their information if needed
      await db.update(users)
        .set({
          name: user.displayName || existingUser.name,
          email: user.primaryEmail || existingUser.email,
          updated: new Date(),
        })
        .where(sql`${users.id} = ${user.id}`);
        
      return existingUser;
    } else {
      // User doesn't exist, create a new record
      await db.insert(users)
        .values({
          id: user.id,
          name: user.displayName || null,
          email: user.primaryEmail || null,
          created: new Date(),
          updated: new Date(),
        });
        
      // Return the newly created user
      const newUsers = await db.select()
        .from(users)
        .where(sql`${users.id} = ${user.id}`)
        .limit(1);
        
      return newUsers[0];
    }
  } catch (error) {
    console.error("Failed to sync user with database:", error);
    return null;
  }
}
