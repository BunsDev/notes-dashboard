import { syncUserWithDatabase } from './sync-user';
import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';

/**
 * Hook that synchronizes Stack Auth user with our database
 * This should be used in client components where authentication matters
 */
export function useAuthSync() {
  const user = useUser();

  useEffect(() => {
    // When user state changes (login/logout), sync with database
    if (user) {
      // Call our server action to sync user
      syncUserWithDatabase().catch(error => {
        console.error('Failed to sync user with database:', error);
      });
    }
  }, [user?.id]); // Only run when user ID changes

  return { user };
}
