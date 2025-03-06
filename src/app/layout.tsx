"use client";

import { usePathname } from "next/navigation";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";
import { PageIndicatorProvider } from "./context/PageIndicatorContext";

import Sidebartalim from "@/components/TalimSidebar/Sidebar";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isTalimPage = pathname.includes("talim");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <PageIndicatorProvider>
          <div className="flex">
            {/* Sidebar appears only on "talim" pages, no login restriction */}
            {isTalimPage && (
              <Sidebartalim className="fixed left-0 top-0 h-full w-64 bg-gray-200" />
            )}

            <main
              className={classNames("flex-1 p-4", {
                "ml-64": isTalimPage, // Sidebar pushes content
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
