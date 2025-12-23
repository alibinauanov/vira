import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
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
