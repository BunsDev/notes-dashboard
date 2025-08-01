/**
 * Server-side user authentication helper functions
 * NOTE: This file should only be imported in server components or API routes
 */
import { stackServerApp } from "@/app/stack";
import type { CurrentServerUser } from "@stackframe/stack";

/**
 * Get the current authenticated user
 * Only use this function in server components or API routes
 */
export async function getCurrentUser(): Promise<CurrentServerUser | null> {
  return stackServerApp.getUser();
}

/**
 * Get the current authenticated user, redirecting to sign in if not authenticated
 */
export async function getCurrentUserOrRedirect(): Promise<CurrentServerUser> {
  return stackServerApp.getUser({ or: "redirect" });
}
