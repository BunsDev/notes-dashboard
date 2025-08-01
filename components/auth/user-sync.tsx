'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';

/**
 * Component that handles synchronization of Stack Auth user data 
 * with the application database. This is a client component that
 * makes API calls when a user logs in or their data changes.
 */
export function UserSync() {
  const user = useUser();
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    // Only attempt sync when we have a user
    if (user?.id) {
      // Prevent excessive syncing by limiting frequency
      const now = Date.now();
      if (lastSyncTime && now - lastSyncTime < 5000) {
        // Skip if last sync was less than 5 seconds ago
        return;
      }
      
      setSyncStatus('syncing');
      setLastSyncTime(now);
      
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
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Sync failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setSyncStatus('success');
        console.log('User sync successful:', data.status);
      })
      .catch(error => {
        setSyncStatus('error');
        console.error('Failed to sync user with database:', error);
        
        // Retry once after 3 seconds if there was an error
        setTimeout(() => {
          if (user?.id) {
            setSyncStatus('syncing');
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
            })
            .then(response => response.json())
            .then(() => setSyncStatus('success'))
            .catch(() => setSyncStatus('error'));
          }
        }, 3000);
      });
    }
  }, [user?.id, user?.displayName, user?.primaryEmail, lastSyncTime]);

  // This is a non-visual component
  return null;
}
