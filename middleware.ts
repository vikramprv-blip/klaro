
const PAID_LOCKED_PATHS = [
  "/app",
  "/admin",
  "/clients",
  "/work-items",
  "/documents",
  "/in/ca",
]

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = [
  "/admin",
  "/in",
  "/us",
  "/uk",
  "/eu",
  "/uae",
  "/asia",
  "/dashboard",
  "/work-items",
  "/documents",
  "/clients",
  "/invoices",
  "/settings",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/signin" || pathname === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/in/ca";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/in/:path*",
    "/us/:path*",
    "/uk/:path*",
    "/eu/:path*",
    "/uae/:path*",
    "/asia/:path*",
    "/dashboard/:path*",
    "/work-items/:path*",
    "/documents/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/settings/:path*",
    "/signin",
    "/signup",
  ],
};
