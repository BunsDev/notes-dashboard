import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";

// Use Node.js runtime for this API route to support crypto module
export const runtime = 'nodejs';

/**
 * API route to sync Stack Auth user with database
 * This is called from the client-side after authentication
 * 
 * Integrated with Neon Auth and Stack Auth for user management
 */
export async function POST(request: Request) {
  try {
    // Verify the user is actually logged in with Stack Auth
    const authUser = await stackServerApp.getUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized - No authenticated user found" },
        { status: 401 }
      );
    }

    const { userId, name, email } = await request.json();

    // Double check that the user ID matches the authenticated user
    if (userId !== authUser.id) {
      return NextResponse.json(
        { error: "Unauthorized - User ID mismatch" },
        { status: 401 }
      );
    }

    // Additional user data from Stack Auth that could be stored
    const userMetadata = {
      userId: authUser.id,
      name: name || authUser.displayName,
      email: email || authUser.primaryEmail,
      // Include additional fields from authUser if needed
      updated: new Date(),
    };

    // Check if user already exists in database using Drizzle's eq function
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (existingUser) {
      // User exists, update their information
      await db
        .update(users)
        .set({
          name: userMetadata.name || existingUser.name,
          email: userMetadata.email || existingUser.email,
          updated: userMetadata.updated,
        })
        .where(eq(users.id, userId));

      return NextResponse.json({
        status: "updated",
        userId: userId,
        user: {
          id: userId,
          name: userMetadata.name || existingUser.name,
          email: userMetadata.email || existingUser.email
        }
      });
    } else {
      // User doesn't exist, create a new record
      const newUser = {
        id: userId,
        name: userMetadata.name || null,
        email: userMetadata.email || null,
        created: new Date(),
        updated: userMetadata.updated,
      };

      await db.insert(users).values(newUser);

      return NextResponse.json({
        status: "created",
        userId: userId,
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email
        }
      });
    }
  } catch (error) {
    console.error("Failed to sync user with database:", error);
    return NextResponse.json(
      { error: "Failed to sync user", message: (error as Error).message },
      { status: 500 }
    );
  }
}
