import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "vikramprv@gmail.com";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // ── /admin — HARD BLOCK, admin email only ──────────────
  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/signin", request.url));
    if (user.email !== ADMIN_EMAIL) return NextResponse.redirect(new URL("/in/lawyer", request.url));
    return response;
  }

  // ── Auth required for protected paths ──────────────────
  const protectedPrefixes = ["/in/ca", "/in/lawyer", "/settings", "/dashboard", "/work-items", "/documents", "/clients", "/invoices"];
  const isProtected = protectedPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // ── Role isolation for /in/* ───────────────────────────
  if (user && pathname.startsWith("/in/")) {
    const { data: member } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = member?.role || "both";

    // admin and both can access everything — no redirect
    if (role !== "both" && role !== "admin") {
      if (pathname.startsWith("/in/lawyer") && role === "ca" && role !== "both") {
        return NextResponse.redirect(new URL("/in/ca", request.url));
      }
      if (pathname.startsWith("/in/ca") && role === "lawyer") {
        return NextResponse.redirect(new URL("/in/lawyer", request.url));
      }
    }
  }

  // ── Already signed in hitting signin/signup ─────────────
  if (user && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/post-login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/in/:path*",
    "/settings/:path*",
    "/dashboard/:path*",
    "/work-items/:path*",
    "/documents/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/signin",
    "/signup",
  ],
};
