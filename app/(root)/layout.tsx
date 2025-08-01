'use client';

import { SuspenseProvider } from '@/components/auth/suspense-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuspenseProvider>
      {children}
    </SuspenseProvider>
  );
}
