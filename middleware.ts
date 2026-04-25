
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
import { hasActivePlan } from "@/lib/billing/check";

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

  const isApi = pathname.startsWith("/api");

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if ((isProtected || isApi) && !user) {
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

  
  // 🔒 BILLING LOCK
  if (user) {
    const email = user.email || "";

    const isPublicApi = pathname.startsWith("/api/auth") || pathname.startsWith("/api/billing") || pathname.startsWith("/api/payments") || pathname.startsWith("/api/onboarding") || pathname.startsWith("/api/me");

    const isBillingPage = pathname.startsWith("/billing");
    const isPublic = pathname === "/" || pathname.startsWith("/pricing") || pathname.startsWith("/post-login") || pathname.startsWith("/onboarding");

    if (!isBillingPage && !isPublic && !(isApi && isPublicApi)) {
      const hasPlan = await hasActivePlan(email);

      if (!hasPlan) {
        const url = request.nextUrl.clone();
        url.pathname = "/billing";
        return NextResponse.redirect(url);
      }
    }
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
    "/billing",
    "/signin",
    "/signup",
  ],
};
