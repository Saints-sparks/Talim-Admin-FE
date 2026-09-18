'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/app/context/AuthContext';
import { NavigationLoadingProvider } from '@/app/context/NavigationLoadingContext';
import { NavigationLoading } from '@/components/ui/navigation-loading';

/**
 * The provider stack. `QueryProvider` sits outermost because `AuthProvider`
 * clears the query cache on sign-out.
 *
 * @param props - Standard children.
 * @param props.children - The application tree.
 * @returns The wrapped tree.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <NavigationLoadingProvider>
        <AuthProvider>
          <NavigationLoading />
          <Toaster richColors />
          {children}
        </AuthProvider>
      </NavigationLoadingProvider>
    </QueryProvider>
  );
}
