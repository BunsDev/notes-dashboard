import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api/users";

// Only check for authentication in middleware
export async function middleware(req: NextRequest) {

    const { pathname } = req.nextUrl; // Get the current path
    const protectedPaths = ["/notes"];

    // Auth check (NextAuth JWT)
    const user = await getCurrentUser();
    if (protectedPaths.includes(pathname)) {
        if (!user || !user.primaryEmail || !user.id) {
            return NextResponse.redirect(new URL("/handler/sign-up", req.url));
        }
    }

    // If signed-in user tries to access sign-up or log-in, redirect to log-out
    const isAuthRoute = ["/handler/sign-up", "/handler/log-in"].includes(
        pathname
    );
    if (isAuthRoute) {
        return NextResponse.redirect(new URL("/handler/sign-out", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/settings",
    ],
};
