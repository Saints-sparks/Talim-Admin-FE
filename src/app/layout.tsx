"use client";

// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import { PageIndicatorProvider } from "./context/PageIndicatorContext";
import Sidebar from "@/components/Sidebar";
import Sidebartalim from "@/components/TalimSidebar/Sidebar";
import { usePathname } from "next/navigation"; // Import usePathname for routing
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
  const isTalimPage = pathname.includes("talim");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <PageIndicatorProvider>
          {/* Main layout structure */}
          <div className="flex">
            {/* Conditionally render the appropriate sidebar */}
            {isTalimPage ? (
              <Sidebartalim className="fixed left-0 top-0 h-full w-64 bg-gray-200" />
            ) : (
              <Sidebar className="fixed left-0 top-0 h-full w-64 bg-black" />
            )}

            <main
              className={classNames("flex-1 p-4", {
                "ml-64": true, // Add margin-left only when a sidebar is rendered
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
