import { auth } from "@/lib/auth/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedPage =
    request.nextUrl.pathname.startsWith("/") ||
    request.nextUrl.pathname.startsWith("/profile");

  // Redirecionar usuários autenticados das páginas de auth
  if (isAuthPage && session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirecionar usuários não autenticados de páginas protegidas
  if (isProtectedPage && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};
