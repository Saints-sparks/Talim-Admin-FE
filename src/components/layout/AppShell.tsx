'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebartalim from '@/components/TalimSidebar/Sidebar';
import { useAuthContext } from '@/app/context/AuthContext';

const PROTECTED_ROUTE_PREFIXES = [
  '/talimadmindashboard',
  '/talimschool',
  '/talimsupport',
  '/talimregister',
  '/SchoolProfile',
];

const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  const shouldProtectRoute = isProtectedRoute(pathname);
  const showSidebar = shouldProtectRoute && isAuthenticated;

  useEffect(() => {
    if (!shouldProtectRoute || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/talimadminlogin');
    }
  }, [isAuthenticated, isLoading, shouldProtectRoute, router]);

  if (shouldProtectRoute && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {showSidebar ? (
        <Sidebartalim className="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white" />
      ) : null}
      <main className={showSidebar ? 'flex-1 pl-64' : 'flex-1'}>{children}</main>
    </div>
  );
}

