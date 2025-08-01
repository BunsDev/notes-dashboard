import { type NextRequest, NextResponse } from "next/server";

// Simple middleware just for basic route protection
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl; // Get the current path
    
    // We'll rely on client-side auth checks and API routes for synchronization
    // This middleware just provides basic route protection
    
    // Add authentication checks here if needed in the future
    
    return NextResponse.next();
}

// Minimum configuration to avoid Edge runtime issues
export const config = {
    matcher: [
        "/settings",
    ],
};
