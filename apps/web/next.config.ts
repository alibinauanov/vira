import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async rewrites() {
    return [
      {
        // Rewrite paths that have multiple segments (not restaurant slugs)
        // Exclude: _next, files with extensions, api, demo, statistics, and single-segment paths
        // This allows /[slug] routes to work while still serving SPA for other paths
        source: "/((?!_next/|.*\\..*|api/|demo/|statistics/)[^/]+/[^/]+.*)",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
