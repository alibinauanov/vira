import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Serve the single-page app for any non-asset path without changing the URL.
        source: "/((?!_next/|.*\\..*).*)",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
