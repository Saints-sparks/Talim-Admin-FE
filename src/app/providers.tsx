'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/app/context/AuthContext';
import { NavigationLoadingProvider } from '@/app/context/NavigationLoadingContext';
import { PageIndicatorProvider } from '@/app/context/PageIndicatorContext';
import { NavigationLoading } from '@/components/ui/navigation-loading';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationLoadingProvider>
      <PageIndicatorProvider>
        <AuthProvider>
          <NavigationLoading />
          <Toaster richColors />
          {children}
        </AuthProvider>
      </PageIndicatorProvider>
    </NavigationLoadingProvider>
  );
}

