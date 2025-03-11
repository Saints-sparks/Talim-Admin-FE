"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageIndicatorProvider } from "@/app/context/PageIndicatorContext";
import { NavigationLoadingProvider } from "@/app/context/NavigationLoadingContext";
import { NavigationLoading } from "@/components/ui/navigation-loading";
import { Toaster } from 'sonner';
import { AuthProvider } from "@/app/context/AuthContext";
import { useAuthContext } from "@/app/context/AuthContext";
import Sidebartalim from "@/components/TalimSidebar/Sidebar";
import classNames from "classnames";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();
  const isLoginPage = pathname === '/talimadminlogin';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push('/talimadminlogin');
      } else if (isAuthenticated && isLoginPage) {
        router.push('/talimadmindashboard');
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Only show sidebar if not on login page */}
      {!isLoginPage && <Sidebartalim className="fixed left-0 top-0 h-full w-64 bg-gray-200" />}

      {/* Adjust main content margin based on whether sidebar is shown */}
      <main className={classNames(
        "flex-1 p-4",
        !isLoginPage && "ml-64" // Only add margin when sidebar is shown
      )}>
        {children}
      </main>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NavigationLoadingProvider>
        <PageIndicatorProvider>
          <NavigationLoading />
          <Toaster richColors />
          <LayoutContent>
            {children}
          </LayoutContent>
        </PageIndicatorProvider>
      </NavigationLoadingProvider>
    </AuthProvider>
  );
} 