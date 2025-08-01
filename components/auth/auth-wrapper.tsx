'use client';

import { UserSync } from './user-sync';
import { useUser } from '@stackframe/stack';
import { ReactNode, useEffect } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

/**
 * AuthWrapper ensures that authenticated users are always synchronized
 * with the database by including the UserSync component and providing
 * additional authentication state management.
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const user = useUser();

  useEffect(() => {
    // You could add additional auth state management logic here
    if (user) {
      console.log('User authenticated:', user.id);
    }
  }, [user]);

  return (
    <>
      {/* Invisible component that syncs the user with our database */}
      <UserSync />
      
      {/* Render the wrapped content */}
      {children}
    </>
  );
}
