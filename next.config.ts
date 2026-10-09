import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The e2e suite runs its own `next dev` into `.next-e2e` (playwright.config.ts), beside a developer's `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
   images: {
        domains: ['res.cloudinary.com']
    }
};

export default nextConfig;
