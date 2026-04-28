import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

export async function GET() {
  const { data } = await sb.from("us_cross_firm_links").select("*").eq("initiating_firm", FIRM).order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const { partner_firm_email, partner_firm_name, client_name, matter_ref } = await req.json();
  const { data, error } = await sb.from("us_cross_firm_links")
    .insert([{ initiating_firm: FIRM, partner_firm_email, partner_firm_name, client_name, matter_ref, status: "pending" }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send invite email
  if (RESEND_KEY && partner_firm_email) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: "Klaro <contact@klaro.services>",
        to: partner_firm_email,
        subject: `${partner_firm_name || "A firm"} invited you to collaborate on ${client_name} — Klaro`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#111">You've been invited to a shared client workspace</h2>
            <p>Your firm has been invited to collaborate on <strong>${client_name}</strong> via Klaro's cross-firm collaboration platform.</p>
            <p>Klaro eliminates blocker blindness between law firms and CPA firms. When either firm has a blocker, both teams are automatically notified.</p>
            <a href="https://klaro.services/us/signup" style="display:inline-block;background:#111;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Accept invitation →</a>
            <p style="color:#666;font-size:12px;margin-top:24px">Klaro Tech · contact@klaro.services · klaro.services</p>
          </div>
        `
      })
    }).catch(() => {});
  }

  return NextResponse.json(data);
}
