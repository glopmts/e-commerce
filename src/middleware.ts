import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/", "/profile", "/settings", "/user"];

const authRoutes = ["/login", "/signup", "/signin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const sessionToken = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionToken;

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/user/:path*",
};
