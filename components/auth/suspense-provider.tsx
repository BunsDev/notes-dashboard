'use client';

import { Suspense } from 'react';
import { AuthWrapper } from './auth-wrapper';

interface SuspenseProviderProps {
  children: React.ReactNode;
}

/**
 * SuspenseProvider wraps children in a Suspense boundary
 * This allows client components that use useUser() to be properly suspended
 */
export function SuspenseProvider({ children }: SuspenseProviderProps) {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <AuthWrapper>
        {children}
      </AuthWrapper>
    </Suspense>
  );
}
