'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebartalim from '@/components/TalimSidebar/Sidebar';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/app/context/AuthContext';
import { isPublicRoute } from '@/lib/roles';
import { AppFooter } from './AppFooter';

/**
 * The application chrome. Every route passes through {@link RouteGuard} first,
 * so the sidebar only ever renders for a signed-in platform administrator.
 * Every route ends with the footer, which shows the version from
 * `package.json`.
 *
 * @param props - Standard children.
 * @param props.children - The active page.
 * @returns The shell element.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const showSidebar = !isPublicRoute(pathname) && isAuthenticated;

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      {showSidebar && (
        <Sidebartalim className="fixed inset-y-0 left-0 z-40 w-[280px] border-r border-[#F1F1F1] bg-[#FBFBFB]" />
      )}
      <main className={`flex min-w-0 flex-1 flex-col ${showSidebar ? 'lg:pl-[280px]' : ''}`}>
        <div className="flex-1">
          <RouteGuard>{children}</RouteGuard>
        </div>
        <AppFooter />
      </main>
    </div>
  );
}
