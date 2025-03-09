"use client";

// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import { PageIndicatorProvider } from "./context/PageIndicatorContext";

import Sidebartalim from "@/components/TalimSidebar/Sidebar";
import { usePathname } from "next/navigation"; // Import usePathname for route handling
import classNames from "classnames"; // Import classnames

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

// Google Font: Poppins
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get current route

  // Check if the current route contains "talim"
  const isTalimPage = pathname.includes("talimadmindashboard");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <PageIndicatorProvider>
          {/* Main layout structure */}
          <div className="flex">
            {/* Render the Talim sidebar only if the route contains "talim" */}
            {isTalimPage && (
              <Sidebartalim className="fixed left-0 top-0 h-full w-64 bg-gray-200" />
            )}

            <main
              className={classNames("flex-1 p-4", {
                "ml-64": isTalimPage, // Apply margin-left only when the sidebar is present
              })}
            >
              {children}
            </main>
          </div>
        </PageIndicatorProvider>
      </body>
    </html>
  );
}
