import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(req: Request) {
  const GITHUB_TOKEN = process.env.GITHUB_PAT;
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: "GITHUB_PAT not configured" }, { status: 500 });
  }

  const adminKey = req.headers.get("x-admin-key");
  const isAdminBypass = adminKey && adminKey === process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isAdminBypass) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const target_url = body.target_url || "";
  const scan_mode = body.scan_mode || "standard";

  const response = await fetch(
    "https://api.github.com/repos/vikramprv-blip/klaro-pulse/actions/workflows/pulse.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { target_url, scan_mode },
      }),
    }
  );

  if (response.status === 204) {
    return NextResponse.json({
      ok: true,
      message: scan_mode === "lam"
        ? `LAM audit queued for ${target_url} — results in 8-12 min`
        : target_url
          ? `Scanning ${target_url} — results in 3-5 min`
          : "Batch scan triggered — results in 5-10 min",
    });
  }

  const err = await response.text();
  return NextResponse.json({ error: "GitHub trigger failed", detail: err }, { status: 500 });
}
