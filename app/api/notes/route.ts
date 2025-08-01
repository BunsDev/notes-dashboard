import { createNote, getNotes, getNoteById, deleteNote, getUserById } from "@/lib/db/actions";
import { db } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api/users";

// Use Node.js runtime for this API route to support crypto module
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const searchParams = request?.nextUrl?.searchParams;
    console.log("/api/notes GET: ", { searchParams });

    const id = searchParams?.get("id");
    console.log("api/notes GET: ", { id });

    const user = await getCurrentUser();
    if (!user) {
        console.log("/api/notes GET: User not found");
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notes = await getNotes();
    // console.log({ notes })
    console.log("/api/notes GET: Notes retrieved successfully");
    if (id) {
        const note = await getNoteById(id);
        // console.log({ note })
        console.log("/api/notes GET: Note retrieved successfully");
        return NextResponse.json({ note });
    }
    return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
    const body = await request?.json();
    console.log("/api/notes POST: Request body", { body });

    try {
        // Validate required fields
        if (!body.title) {
            console.log("/api/notes POST: Title is required");
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        if (!body.content) {
            console.log("/api/notes POST: Content is required");
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        if (!body.userId) {
            console.log("/api/notes POST: User ID is required");
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        if (!body.categoryId) {
            console.log("/api/notes POST: Category ID is required");
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        const user = await getCurrentUser();
        if (!user) {
            console.log("/api/notes POST: User not found");
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create the note input object
        const noteInput = {
            title: body.title,
            userId: user.id,
            content: body.content,
            categoryId: body.categoryId,
            urls: body.urls || [],
            isPinned: body.isPinned || false,
        };

        console.log("/api/notes POST: Creating note", noteInput);

        // Create the note in the database
        const newNote = await createNote(noteInput);
        if (!newNote.success) {
            console.error("/api/notes POST: Failed to create note", newNote.error);
            return NextResponse.json(
                { error: newNote.error || "Failed to create note" },
                { status: 500 },
            );
        }

        console.log("/api/notes POST: Note created successfully");
        return NextResponse.json({
            success: true,
            note: newNote,
        });
    } catch (error) {
        console.error("/api/notes POST: Note creation error:", error);
        return NextResponse.json(
            { error: "Failed to create note" },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/notes?id={id} - Delete an existing note
 */
export async function DELETE(request: NextRequest) {
    console.log("api/notes DELETE: ", request);


    // const body = await request?.json();
    // console.log("api/notes DELETE: ", body);
    try {

        // Get note ID from URL query parameter
        const id = new URL(request.url).searchParams.get("id");
        if (!id) {
            return NextResponse.json(
                { error: "Note ID is required" },
                { status: 400 },
            );
        }

        // Get user ID from request (in a real app, this would come from authentication)
        // For now, we're just validating the note exists
        const existingNote = await getNoteById(id);
        console.log("/api/notes DELETE: Found note", existingNote);

        if (!existingNote.success || !existingNote.data) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 },
            );
        }

        // Check if user is authorized to delete the note
        const user = await getCurrentUser();
        if (!user) {
            console.log("/api/notes DELETE: User not found");
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (existingNote.data.userId !== user.id) {
            console.log("/api/notes DELETE: Unauthorized to delete this note");
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        console.log("/api/notes DELETE: Deleting note...");

        // Delete note
        const result = await deleteNote(id);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to delete note" },
                { status: 500 },
            );
        }

        console.log("/api/notes DELETE: Note deleted successfully");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("/api/notes DELETE: Error deleting note:", error);
        return NextResponse.json(
            { error: "Failed to delete note" },
            { status: 500 },
        );
    }
}
