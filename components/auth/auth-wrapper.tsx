'use client';

import { usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { useEffect } from 'react';
import { UserSync } from './user-sync';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Auth wrapper component that provides authentication functionality
 * and ensures user data is properly synced with the database
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const user = useUser();
  const pathname = usePathname();

  // When user logs in, sync with database
  useEffect(() => {
    // Only log for debugging
    if (user) {
      console.log('User authenticated:', user.id);
    }
  }, [user?.id]);

  return (
    <>
      {/* Include UserSync component to ensure database sync */}
      <UserSync />
      {children}
    </>
  );
}
