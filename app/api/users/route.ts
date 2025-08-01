import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getCurrentUserOrRedirect } from "@/lib/api/users";
import { deleteUser, getUserById, getUsers, updateUser } from "@/lib/db/actions";
import { DBUserUpdateInput } from "@/lib/types/users";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createId } from "@paralleldrive/cuid2";

/**
 * GET - Retrieve users
 * Supports two modes:
 * - All users (requires admin privileges in the future)
 * - Current user profile (when no id param provided)
 * 
 * Also handles auto-creation of users if they don't exist in the database yet
 */
export async function GET(request: NextRequest) {
	try {
		// Get authenticated user
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}
		console.log("/api/users GET: Current user", currentUser);

		// Check if a specific user ID is requested
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("id");
		console.log("/api/users GET: User ID", userId);

		if (userId) {
			// For now, a user can only access their own data
			// Future: Add admin check for accessing other users
			if (userId !== currentUser.id) {
				return NextResponse.json(
					{ error: "Unauthorized to access this user" }, 
					{ status: 403 }
				);
			}
			
			// Get specific user
			const result = await getUserById(userId);
			console.log("/api/users GET: Found user", result);
			
			// If user doesn't exist in our database yet, create them
			if (!result.success || !result.data) {
				console.log("/api/users GET: User not found in database, creating...");
				// Create the user in our database using auth info
				const newUser = {
					id: currentUser.id,
					name: currentUser.displayName || null,
					email: currentUser.primaryEmail || null,
					created: new Date(),
					updated: new Date(),
				};
				
				try {
					await db.insert(users).values(newUser);
					console.log("/api/users GET: User created successfully", newUser);
					return NextResponse.json({ user: newUser, created: true });
				} catch (createError) {
					console.error("Error creating user:", createError);
					return NextResponse.json(
						{ error: "Failed to create user", message: (createError as Error).message },
						{ status: 500 }
					);
				}
			}
			
			return NextResponse.json({ user: result.data });
		} else {
			// Default to returning current user profile
			const result = await getUserById(currentUser.id);
			console.log("/api/users GET: Found user", result);

			// If user doesn't exist in our database yet, create them
			if (!result.success || !result.data) {
				console.log("/api/users GET: User not found in database, creating...");
				// Create the user in our database using auth info
				const newUser = {
					id: currentUser.id,
					name: currentUser.displayName || null,
					email: currentUser.primaryEmail || null,
					created: new Date(),
					updated: new Date(),
				};
				
				try {
					await db.insert(users).values(newUser);
					console.log("/api/users GET: User created successfully", newUser);
					return NextResponse.json({ user: newUser, created: true });
				} catch (createError) {
					console.error("Error creating user:", createError);
					return NextResponse.json(
						{ error: "Failed to create user", message: (createError as Error).message },
						{ status: 500 }
					);
				}
			}
			
			return NextResponse.json({ user: result.data });
			
			// Future: Add admin-only permission to list all users
			// const result = await getUsers();
			// return NextResponse.json({ users: result.data });
		}
	} catch (error) {
		console.error("Error retrieving user(s):", error);
		return NextResponse.json(
			{ error: "Failed to retrieve user data" },
			{ status: 500 }
		);
	}
}

/**
 * PUT - Update the current user
 */
export async function PUT(request: NextRequest) {
	try {
		// Get authenticated user
		const currentUser = await getCurrentUser();
		console.log("/api/users PUT: Current user", currentUser);
		if (!currentUser) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}
		const userId = currentUser.id;

		// Parse request body
		const data = (await request.json()) as DBUserUpdateInput;

		// Update the user
		const updatedUser = await updateUser(userId, data);
		return NextResponse.json({ user: updatedUser.data });
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}

/**
 * POST - Create a new user (primarily for admin or testing purposes)
 * In production, users should typically be created through the auth flow
 */
export async function POST(request: NextRequest) {
	try {
		// Get authenticated user - only allow creation for authenticated users
		// Future: Add admin check for creating other users
		const currentUser = await getCurrentUser();
		console.log("/api/users POST: Current user", currentUser);
		if (!currentUser) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		// Parse request body
		const data = await request.json();

		// Generate a unique ID if not provided
		const userId = data.id || createId();

		// Insert the new user
		const newUser = {
			id: userId,
			name: data.name || null,
			email: data.email || null,
			created: new Date(),
			updated: new Date(),
		};

		await db.insert(users).values(newUser);

		return NextResponse.json({
			status: "created",
			user: newUser
		}, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Failed to create user", message: (error as Error).message },
			{ status: 500 }
		);
	}
}

/**
 * DELETE - Remove a user
 * Can delete the current user or (with admin permission) other users
 */
export async function DELETE(request: NextRequest) {
	try {
		// Get authenticated user
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		// Get the user ID to delete from query params
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("id");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		// For now, a user can only delete their own account
		// Future: Add admin check for deleting other users
		if (userId !== currentUser.id) {
			return NextResponse.json(
				{ error: "Unauthorized to delete this user" },
				{ status: 403 }
			);
		}

		// Delete the user
		await deleteUser(userId);

		return NextResponse.json({
			status: "deleted",
			userId: userId
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}
