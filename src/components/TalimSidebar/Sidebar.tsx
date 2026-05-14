'use client';

import { cn } from '../../app/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Book,
  LayoutDashboard,
  School,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Loader2,
  ChevronLeft,
  Shield,
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
  { title: 'Dashboard',         href: '/talimadmindashboard',                   icon: LayoutDashboard },
  { title: 'School Management', href: '/talimschool',                           icon: School          },
  { title: 'Notifications',     href: '/talimadmindashboard/talimannouncement', icon: Bell            },
  { title: 'Support',           href: '/talimsupport',                          icon: HelpCircle      },
  { title: 'Settings',          href: '/talimadmindashboard/talimsetting',      icon: Settings        },
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
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden',
          isOpen ? 'block' : 'hidden',
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7E6F6] bg-white text-[#003366] shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronLeft className={cn('h-4 w-4 transition-transform', !isOpen && 'rotate-180')} />
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          'bg-[#FBFBFB] border-r border-[#F1F1F1] flex flex-col justify-between overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        {/* ── Top section ── */}
        <div>
          {/* Logo row */}
          <div className="flex items-center gap-2 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003366] shrink-0">
              <Book className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#030E18]">Talim</span>
            <span className="ml-1 rounded-full bg-[#EAF2FB] px-2.5 py-0.5 text-xs font-semibold text-[#003366]">
              Admin
            </span>
          </div>

          {/* Divider */}
          <div className="border-b-2 border-[#F1F1F1] mb-4" />

          {/* Platform card */}
          <div className="mx-4 mb-5 flex items-center gap-3 rounded-xl border border-[#F1F1F1] bg-white px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#003366]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#030E18]">Platform Admin</p>
              <p className="text-xs text-[#6F6F6F] truncate">Super Administrator</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3">
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/talimadmindashboard'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsNavigating(true)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[#003366]/[0.12] text-[#003366]'
                          : 'text-[#6F6F6F] hover:bg-gray-100 hover:text-[#030E18]',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-[#003366]' : 'text-[#878787]',
                        )}
                      />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* ── Bottom user section ── */}
        <div>
          <div className="border-t-2 border-[#F1F1F1] mb-3" />

          <div className="px-4 pb-4 space-y-0.5">
            {/* User card */}
            <Link
              href="/talimadmindashboard/talimsetting"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-9 w-9 ring-2 ring-[#D7E6F6] shrink-0">
                <AvatarImage src={user?.userAvatar ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-[#EAF2FB] text-[#003366] text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#030E18]">{displayName}</p>
                <p className="truncate text-xs text-[#6F6F6F]">{user?.email}</p>
              </div>
            </Link>

            {/* Logout */}
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6F6F6F] hover:bg-gray-100 hover:text-red-500 transition-colors disabled:opacity-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
              ) : (
                <LogOut className="h-5 w-5 shrink-0" />
              )}
              {isLoggingOut ? 'Logging out…' : 'Logout Account'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
