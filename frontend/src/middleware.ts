import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to safely decode JWT payload in Edge runtime
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  // Extract role from cookie or decoded JWT token
  let role: string | null = request.cookies.get("user_role")?.value || null;
  if (!role && token) {
    const decoded = decodeJwtPayload(token);
    role = decoded?.role || null;
  }

  const upperRole = String(role || "").toUpperCase();
  const isAdmin = upperRole === "ADMIN" || upperRole === "SUPER_ADMIN";

  const isAdminRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  const isCustomerProtectedRoute =
    pathname === "/cart" ||
    pathname.startsWith("/cart/") ||
    pathname === "/favorite" ||
    pathname.startsWith("/favorite/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/");

  // 1. Protect Admin / Super Admin routes
  if (isAdminRoute) {
    // If not logged in at all, redirect to login with callback
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If logged in as regular USER, prohibit access and redirect to home
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Protect Customer routes: Cart, Wishlist (Favorite), Profile, Checkout
  if (isCustomerProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. If already authenticated and visits /login or /register, redirect to appropriate home
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute && token) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/cart",
    "/cart/:path*",
    "/favorite",
    "/favorite/:path*",
    "/profile",
    "/profile/:path*",
    "/checkout",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};
