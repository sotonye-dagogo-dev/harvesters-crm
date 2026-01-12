import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/utils/auth";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/about",
  "/contact",
];

// Define role-based routes
const roleRoutes = {
  SUPERADMIN: ["/superadmin"],
  LEADER: ["/leader"],
  MEMBER: ["/member"],
};

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
    const user = await verifyToken(accessToken);

    if (!user) {
      throw new Error("Invalid token");
    }

    // Check role-based access
    for (const [role, routes] of Object.entries(roleRoutes)) {
      const hasAccess = routes.some((route) => pathname.startsWith(route));

      if (hasAccess && user.role !== role) {
        // User trying to access route they don't have permission for
        const url = request.nextUrl.clone();

        // Redirect to appropriate dashboard based on role
        switch (user.role) {
          case "SUPERADMIN":
            url.pathname = "/superadmin/dashboard";
            break;
          case "LEADER":
            url.pathname = "/leader/dashboard";
            break;
          case "MEMBER":
            url.pathname = "/member/dashboard";
            break;
          default:
            url.pathname = "/";
        }

        return NextResponse.redirect(url);
      }
    }

    // User has valid token and appropriate role
    return NextResponse.next();
  } catch (error) {
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
