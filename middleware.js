import { NextResponse } from "next/server";

const COOKIE_NAME = "efes_user";
const VALID_USERS = new Set(["enes", "efsa"]);

// Paths that don't require authentication
const PUBLIC_PATHS = [
  "/giris",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me"
];

// Static asset prefixes that should always be allowed
const STATIC_PREFIXES = [
  "/_next/",
  "/icon",
  "/sw.js",
  "/manifest",
  "/favicon"
];

// Admin-only paths
const ADMIN_PATHS = ["/yonetim"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static assets
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow all API routes (they handle their own auth if needed)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get(COOKIE_NAME)?.value;

  // Not authenticated → redirect to login
  if (!userCookie || !VALID_USERS.has(userCookie)) {
    const loginUrl = new URL("/giris", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only check: only "enes" can access /yonetim
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && userCookie !== "enes") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
