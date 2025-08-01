import { type NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { syncUserWithDatabase } from "@/lib/auth/sync-user";

// Check for authentication and sync user data with database
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl; // Get the current path
    
    // Define protected paths that require authentication
    const protectedPaths = ["/notes"];
    
    // Check if current path is protected
    const isProtectedPath = protectedPaths.some(path => 
        pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isProtectedPath) {
        // Get authenticated user from Stack Auth
        const user = await stackServerApp.getUser();
        
        // If no user is authenticated, redirect to sign-in page
        if (!user) {
            return NextResponse.redirect(new URL("/handler/sign-in", req.url));
        }
        
        // Sync the user with our database to ensure they exist in our users table
        await syncUserWithDatabase();
    }

    // If signed-in user tries to access sign-in or sign-up, redirect to homepage
    const isAuthRoute = ["/handler/sign-in", "/handler/sign-up"].some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (isAuthRoute) {
        const user = await stackServerApp.getUser();
        if (user) {
            return NextResponse.redirect(new URL("/notes", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/notes", 
        "/notes/:path*",
        "/handler/:path*",
        "/settings",
    ],
};
