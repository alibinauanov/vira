import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets.
  const isPublicAsset =
    pathname.startsWith("/_next") || pathname.includes("/static/") || pathname.match(/\.[^/]+$/);
  if (pathname === "/" || isPublicAsset) {
    return NextResponse.next();
  }

  // Rewrite any other route to the homepage to avoid 404s on unknown paths.
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/:path*",
};
