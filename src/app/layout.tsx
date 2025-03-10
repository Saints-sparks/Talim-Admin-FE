"use client";
<<<<<<< HEAD
import { usePathname } from "next/navigation";
=======

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Metadata } from "next";
>>>>>>> 2f7a205040743e4445e2cebf2477e91eca50c808
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import { PageIndicatorProvider } from "./context/PageIndicatorContext";
import { NavigationLoadingProvider } from "./context/NavigationLoadingContext";
import { NavigationLoading } from "@/components/ui/navigation-loading";
import { Toaster } from 'sonner';

import Sidebartalim from "@/components/TalimSidebar/Sidebar";
import TalimAdminDashboard from "@/app/talimadmindashboard/page"
import classNames from "classnames";

// Local Fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
<<<<<<< HEAD
  const isTalimPage = pathname.includes("talimadmindashboard");
=======
  const router = useRouter();
  const isTalimPage = pathname.includes("talim");
>>>>>>> 2f7a205040743e4445e2cebf2477e91eca50c808

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased text-black`}
      >
<<<<<<< HEAD
        <PageIndicatorProvider>
          <div className="flex">
            {/* Sidebar should always appear for testing */}
            <Sidebartalim className="fixed left-0 top-0 h-full w-64 bg-gray-200" />

            <main className={classNames("flex-1 p-4 ml-64")}>
              {/* Always load the login page first for testing */}
              {pathname === "/talimadmindashboard" ? <TalimAdminDashboard /> : children}
            </main>
          </div>
        </PageIndicatorProvider>
=======
        <NavigationLoadingProvider>
          <PageIndicatorProvider>
            <NavigationLoading />
            <Toaster richColors />
            <div className="flex">
              {/* ✅ Sidebar should always appear for testing */}
              <Sidebartalim className="fixed left-0 top-0 h-full w-64 bg-gray-200" />

              <main className={classNames("flex-1 p-4 ml-64")}>
                {/* ✅ Always load the login page first for testing */}
                {pathname === "/talimadmindashboard" ? <TalimAdminDashboard /> : children}
              </main>
            </div>
          </PageIndicatorProvider>
        </NavigationLoadingProvider>
>>>>>>> 2f7a205040743e4445e2cebf2477e91eca50c808
      </body>
    </html>
  );
}
