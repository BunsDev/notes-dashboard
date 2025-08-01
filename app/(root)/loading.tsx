'use client';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground mt-4">Loading your notes...</p>
    </div>
  );
}
