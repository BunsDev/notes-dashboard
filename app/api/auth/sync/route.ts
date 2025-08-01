import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";

/**
 * API route to sync Stack Auth user with database
 * This is called from the client-side after authentication
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

    // Check if user already exists in database
    const existingUsers = await db
      .select()
      .from(users)
      .where(sql`${users.id} = ${userId}`)
      .limit(1);

    const existingUser = existingUsers[0];

    if (existingUser) {
      // User exists, update their information
      await db
        .update(users)
        .set({
          name: name || existingUser.name,
          email: email || existingUser.email,
          updated: new Date(),
        })
        .where(sql`${users.id} = ${userId}`);

      return NextResponse.json({ 
        status: "updated",
        userId: userId
      });
    } else {
      // User doesn't exist, create a new record
      await db.insert(users).values({
        id: userId,
        name: name || null,
        email: email || null,
        created: new Date(),
        updated: new Date(),
      });

      return NextResponse.json({ 
        status: "created",
        userId: userId
      });
    }
  } catch (error) {
    console.error("Failed to sync user with database:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
