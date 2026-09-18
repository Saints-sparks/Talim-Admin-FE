'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { LOGIN_ROUTE, useAuthContext } from '@/app/context/AuthContext';
import { isPublicRoute } from '@/lib/roles';
import { LoadingState } from '@/components/StateComponents';

/**
 * Decides what a visitor is allowed to see before any page renders.
 *
 * Three outcomes, in order:
 * 1. While the cold-start refresh is in flight, nothing but a spinner — so a
 *    signed-in administrator never sees the login screen flash past.
 * 2. No session, or a session whose role is not `admin`: redirect to the login
 *    screen. `AuthContext.isAuthenticated` is already role-checked, so a
 *    school admin or teacher holding a valid Talim refresh cookie for the same
 *    API origin cannot render a single platform screen.
 * 3. Otherwise the page renders.
 *
 * Public routes (the login screen) render either way, but bounce an already
 * signed-in administrator on to the dashboard.
 *
 * @param props - Standard children.
 * @param props.children - The page being guarded.
 * @returns The page, or the placeholder that replaces it.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();
  const isPublic = isPublicRoute(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isPublic && !isAuthenticated) {
      router.replace(LOGIN_ROUTE);
    }
  }, [isAuthenticated, isLoading, isPublic, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8]">
        <LoadingState message="Checking your session…" />
      </div>
    );
  }

  if (!isPublic && !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8F8F8] px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-[#878787]" />
        <p className="text-base font-semibold text-[#030E18]">Administrator access required</p>
        <p className="max-w-sm text-sm text-[#6F6F6F]">
          Only Talim platform administrators can open this portal. Taking you to the sign-in screen…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
