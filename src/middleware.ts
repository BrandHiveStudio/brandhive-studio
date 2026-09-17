import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "bh_admin_session";

function getSigningKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variable: ADMIN_JWT_SECRET");
    }
    return new TextEncoder().encode("brandhive-studio-admin-local-dev-key-change-in-production");
  }
  return new TextEncoder().encode(secret);
}

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: "brandhive-studio-admin",
      audience: "brandhive-admin",
    });
    return Boolean(payload && payload.userId);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply protection to /admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authenticated = await isValidSession(token);

    // Whitelist public admin auth routes
    const publicAdminPaths = [
      "/admin/login",
      "/admin/forgot-password",
      "/admin/reset-password",
      "/admin/verify-email",
    ];

    const isPublicAdminPath = publicAdminPaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

    if (isPublicAdminPath) {
      // If already authenticated and visiting login or forgot-password, redirect to dashboard
      if (authenticated && (pathname === "/admin/login" || pathname === "/admin/forgot-password")) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // For all other /admin routes, require authentication
    if (!authenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
