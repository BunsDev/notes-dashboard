'use client';

import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';

/**
 * Component that handles synchronization of Stack Auth user data 
 * with the application database. This is a client component that
 * makes a server action call when a user logs in.
 */
export function UserSync() {
  const user = useUser();
  
  useEffect(() => {
    // Only attempt sync when we have a user
    if (user?.id) {
      // Use an API endpoint to sync user data
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id,
          name: user.displayName,
          email: user.primaryEmail 
        }),
      }).catch(error => {
        console.error('Failed to sync user with database:', error);
      });
    }
  }, [user?.id, user?.displayName, user?.primaryEmail]);

  // This is a non-visual component
  return null;
}
