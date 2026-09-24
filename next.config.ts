import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Keep Turbopack rooted at the repo so a stray package-lock.json in the
    // parent folder doesn't produce a warning on every `next dev` boot.
    root: __dirname,
  },
};

export default nextConfig;
