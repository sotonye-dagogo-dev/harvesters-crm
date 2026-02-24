import { NextRequest, NextResponse } from "next/server";

/**
 * Root middleware for route protection.
 *
 * - Redirects unauthenticated users away from protected routes.
 * - Redirects authenticated users away from auth routes (login/register).
 * - Validates that users access routes appropriate for their role.
 * - Clears invalid cookies to prevent stale auth state.
 *
 * Note: This middleware decodes the JWT payload without cryptographic
 * verification (Edge runtime limitation without `jose`). Full JWT
 * verification happens in each API route handler via lib/utils/middleware.ts.
 * For production, consider installing `jose` for Edge-compatible JWT verification.
 */

// Roles that map to the /superadmin/* route prefix
const SUPERADMIN_ROLES = ["SUPERADMIN"];

// Roles that map to the /leader/* route prefix
const LEADER_ROLES = [
  "GROUP_PASTOR",
  "GROUP_ADMIN",
  "CAMPUS_PASTOR",
  "CAMPUS_ADMIN",
  "ZONAL_LEADER",
  "HOD",
  "SMALL_GROUP_LEADER",
  "CELL_LEADER",
  "DATA_ENTRY",
];

// Roles that map to the /member/* route prefix
const MEMBER_ROLES = ["MEMBER"];

// Routes that require authentication
const PROTECTED_PREFIXES = ["/superadmin", "/leader", "/member", "/profile"];

// Routes only for unauthenticated users
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Decode the JWT payload without verification.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(
  token: string
): { userId: string; email: string; role: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Base64url → Base64 → decode
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const decoded = JSON.parse(jsonStr);

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get the allowed route prefix for a given role.
 */
function getAllowedPrefix(role: string): string {
  if (SUPERADMIN_ROLES.includes(role)) return "/superadmin";
  if (LEADER_ROLES.includes(role)) return "/leader";
  if (MEMBER_ROLES.includes(role)) return "/member";
  return "/member"; // Default fallback
}

/**
 * Get the dashboard route for a given role.
 */
function getDashboardForRole(role: string): string {
  if (SUPERADMIN_ROLES.includes(role)) return "/superadmin/dashboard";
  if (LEADER_ROLES.includes(role)) return "/leader/dashboard";
  return "/member/dashboard";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the access token from cookies
  const accessToken = request.cookies.get("accessToken")?.value;

  // Decode token payload (lightweight, no verification)
  const tokenPayload = accessToken ? decodeJwtPayload(accessToken) : null;

  // Check if token is expired
  const isAuthenticated =
    tokenPayload !== null &&
    (!tokenPayload.exp || tokenPayload.exp * 1000 > Date.now());

  // If token exists but is invalid/expired, clear cookies and redirect
  if (accessToken && !isAuthenticated) {
    const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  // --- Rule 1: Protect authenticated routes ---
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Rule 2: Redirect authenticated users away from auth pages ---
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && isAuthenticated && tokenPayload) {
    const dashboardUrl = new URL(
      getDashboardForRole(tokenPayload.role),
      request.url
    );
    return NextResponse.redirect(dashboardUrl);
  }

  // --- Rule 3: Role-based route access control ---
  if (isProtectedRoute && isAuthenticated && tokenPayload) {
    const role = tokenPayload.role;
    const allowedPrefix = getAllowedPrefix(role);

    // /profile is accessible to all authenticated users
    if (pathname.startsWith("/profile")) {
      return NextResponse.next();
    }

    // Check if user is accessing a route outside their role's prefix
    const isAccessingSuperadmin = pathname.startsWith("/superadmin");
    const isAccessingLeader = pathname.startsWith("/leader");
    const isAccessingMember = pathname.startsWith("/member");

    const isAllowed =
      (isAccessingSuperadmin && allowedPrefix === "/superadmin") ||
      (isAccessingLeader && allowedPrefix === "/leader") ||
      (isAccessingMember && allowedPrefix === "/member");

    if (!isAllowed) {
      // Redirect to their correct dashboard
      const correctDashboard = new URL(
        getDashboardForRole(role),
        request.url
      );
      return NextResponse.redirect(correctDashboard);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they have their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public assets (images, icons, manifest, sw.js)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|sw\\.js|logo/).*)",
  ],
};
