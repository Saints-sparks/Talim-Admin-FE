"use client";

import { cn } from "../../app/lib/utils";
import { useRouter, usePathname } from "next/navigation"; // ✅ Import usePathname
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Book, LayoutDashboard, School, Bell, HelpCircle, Settings, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { adminProfiles } from "@/data/adminProfiles";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/talimadmindashboard",
    icon: LayoutDashboard,
  },
  {
    title: "School management",
    href: "/talimadmindashboard/schools",
    icon: School,
  },
  {
    title: "Announcements",
    href: "/talimadmindashboard/talimannouncement",
    icon: Bell,
  },
  {
    title: "Support",
    href: "/talimsupport",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    href: "/talimadmindashboard/talimsetting",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebartalim({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current route
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push("/talimadminlogin");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight className={cn("h-4 w-4", isOpen && "rotate-180")} />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center text-gray-700 gap-2 border-b px-6">
          <Book className="h-6 w-6 text-indigo-600" />
          <span className="font-semibold">Talim</span>
        </div>

        {/* Navigation */}
        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href; 

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-gray-300 text-gray-900 font-semibold" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t p-4">
            {isLoggedIn ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={adminProfiles[0].avatar} alt={adminProfiles[0].name} />
                    <AvatarFallback>
                      {adminProfiles[0].name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm text-black font-semibold">{adminProfiles[0].name}</span>
                    <span className="text-xs text-gray-500">{adminProfiles[0].email}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button className="w-full">Login</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}