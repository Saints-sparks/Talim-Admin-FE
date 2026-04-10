'use client';

import { cn } from '../../app/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Book,
  LayoutDashboard,
  School,
  Bell,
  HelpCircle,
  Settings,
  ChevronRight,
  LogOut,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthContext } from '@/app/context/AuthContext';
import { useNavigationLoading } from '@/app/context/NavigationLoadingContext';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/talimadmindashboard', icon: LayoutDashboard },
  { title: 'School management', href: '/talimschool', icon: School },
  { title: 'Announcements', href: '/talimadmindashboard/talimannouncement', icon: Bell },
  { title: 'Support', href: '/talimsupport', icon: HelpCircle },
  { title: 'Settings', href: '/talimadmindashboard/talimsetting', icon: Settings },
];

const getInitials = (first?: string, last?: string, email?: string) => {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'TA';
};

interface SidebarProps {
  className?: string;
}

export default function Sidebartalim({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setIsNavigating } = useNavigationLoading();
  const { user, logout } = useAuthContext();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, setIsNavigating]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? 'Talim Admin';

  const initials = getInitials(user?.firstName, user?.lastName, user?.email);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden',
          isOpen ? 'block' : 'hidden',
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Book className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-slate-900">Talim</span>
          <span className="ml-auto text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        {/* Nav + user */}
        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between overflow-y-auto">
          <nav className="space-y-0.5 p-3 pt-4">
            {navItems.map((item) => {
              const isActive =
                item.href === '/talimadmindashboard'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsNavigating(true)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <item.icon
                    className={cn('h-4 w-4', isActive ? 'text-indigo-600' : 'text-slate-400')}
                  />
                  {item.title}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <Link
              href="/talimadmindashboard/talimsetting"
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors"
            >
              <Avatar className="h-9 w-9 ring-2 ring-indigo-100">
                <AvatarImage src={user?.userAvatar ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </Link>

            <Button
              variant="ghost"
              className="mt-2 w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 text-sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isLoggingOut ? 'Logging out…' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
