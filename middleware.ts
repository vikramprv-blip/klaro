import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/in",
  "/us",
  "/uk",
  "/eu",
  "/uae",
  "/asia",
  "/work-items",
  "/documents",
  "/clients",
  "/invoices",
  "/settings",
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token") ||
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/in/:path*",
    "/us/:path*",
    "/uk/:path*",
    "/eu/:path*",
    "/uae/:path*",
    "/asia/:path*",
    "/work-items/:path*",
    "/documents/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/settings/:path*",
  ],
};
