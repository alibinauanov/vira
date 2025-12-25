import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async rewrites() {
    return [
      {
        // Rewrite paths with 3+ segments (not restaurant routes which are 1-2 segments)
        // Exclude: _next, files with extensions, api, demo, statistics
        // Restaurant routes: /[slug] (1 segment) and /[slug]/booking, /[slug]/menu, /[slug]/whatsapp (2 segments)
        // This allows restaurant routes to work while still serving SPA for other deep paths
        source: "/((?!_next/|.*\\..*|api/|demo/|statistics/)[^/]+/[^/]+/[^/]+.*)",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
