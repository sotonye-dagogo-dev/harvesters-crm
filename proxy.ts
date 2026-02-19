import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/lib/types";
import { verifyToken } from "@/lib/utils/auth";
import { LEADER_ROLES } from "@/lib/constants";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/unregister-sw.html",
];

// Define shared authenticated routes (accessible to all logged-in users)
const sharedAuthRoutes = ["/profile"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes (they have their own middleware)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Get access token from cookies
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // Redirect to login if no token
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify token
    const decoded = await verifyToken(accessToken);

    if (!decoded) {
      throw new Error("Invalid token");
    }

    // Allow shared authenticated routes
    if (sharedAuthRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check role-based access
    // Three route tiers: /superadmin/, /leader/, /member/
    if (pathname.startsWith("/superadmin") && decoded.role !== UserRole.SUPERADMIN) {
      const url = request.nextUrl.clone();
      url.pathname = LEADER_ROLES.includes(decoded.role) ? "/leader/dashboard" : "/member/dashboard";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/leader") && !LEADER_ROLES.includes(decoded.role)) {
      const url = request.nextUrl.clone();
      url.pathname = decoded.role === UserRole.SUPERADMIN ? "/superadmin/dashboard" : "/member/dashboard";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/member") && decoded.role !== UserRole.MEMBER) {
      const url = request.nextUrl.clone();
      url.pathname = decoded.role === UserRole.SUPERADMIN ? "/superadmin/dashboard" : "/leader/dashboard";
      return NextResponse.redirect(url);
    }

    // User has valid token and appropriate role
    return NextResponse.next();
  } catch {
    // Token is invalid or expired
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    // Clear invalid cookies
    const response = NextResponse.redirect(url);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
