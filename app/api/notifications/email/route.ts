import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "Klaro <noreply@klaro.services>";

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return { success: false, reason: "RESEND_API_KEY not configured" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
  });
  const data = await res.json();
  return { success: res.ok, data };
}

function hearingReminderHTML(hearing: any, firm: any) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#1B3A5C;padding:16px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:18px">Klaro — Hearing Reminder</h1>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
        <p style="font-size:14px;color:#374151">Dear ${firm?.name || "Team"},</p>
        <p style="font-size:14px;color:#374151">This is a reminder for an upcoming hearing:</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0;font-size:13px"><strong>Matter:</strong> ${hearing.legal_matters?.matter_title || "—"}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Client:</strong> ${hearing.legal_matters?.client_name || "—"}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Date:</strong> ${hearing.hearing_date}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Court:</strong> ${hearing.court_name || hearing.court || "—"}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Purpose:</strong> ${hearing.purpose || "—"}</p>
        </div>
        <p style="font-size:12px;color:#9ca3af">This email was sent by Klaro on behalf of ${firm?.name || "your firm"}.</p>
        <a href="https://klaro.services/in/lawyer/hearings" style="display:inline-block;background:#1B3A5C;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;margin-top:12px">View in Klaro →</a>
      </div>
    </div>
  `;
}

function deadlineReminderHTML(deadline: any, firm: any) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#B45309;padding:16px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0;font-size:18px">Klaro — Compliance Deadline</h1>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
        <p style="font-size:14px;color:#374151">Dear ${firm?.name || "Team"},</p>
        <p style="font-size:14px;color:#374151">A compliance deadline is approaching:</p>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0;font-size:13px"><strong>Deadline:</strong> ${deadline.title || deadline.label}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Due Date:</strong> ${deadline.due_date}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Type:</strong> ${deadline.type || "Compliance"}</p>
        </div>
        <a href="https://klaro.services/in/ca/deadlines" style="display:inline-block;background:#B45309;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;margin-top:12px">View Deadlines →</a>
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { type, to, data, firm_id } = body;

  const { data: firm } = await supabase.from("firms").select("name, email").eq("id", firm_id || "00000000-0000-0000-0000-000000000001").single();

  let subject = "", html = "";

  switch (type) {
    case "hearing_reminder":
      subject = `Hearing Reminder: ${data.legal_matters?.client_name || "Matter"} — ${data.hearing_date}`;
      html = hearingReminderHTML(data, firm);
      break;
    case "deadline_reminder":
      subject = `Compliance Deadline: ${data.title || data.label} — ${data.due_date}`;
      html = deadlineReminderHTML(data, firm);
      break;
    case "welcome":
      subject = "Welcome to Klaro — your practice management platform";
      html = `<div style="font-family:Arial,sans-serif;padding:24px"><h1 style="color:#1B3A5C">Welcome to Klaro!</h1><p>Your account is ready. <a href="https://klaro.services">Get started →</a></p></div>`;
      break;
    default:
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  }

  const result = await sendEmail(to, subject, html);

  // Log to audit
  await supabase.from("audit_logs").insert([{
    firm_id: firm_id || "00000000-0000-0000-0000-000000000001",
    action: "email_sent",
    entity_type: "notification",
    entity_name: type,
    new_value: { to, subject, success: result.success }
  }]);

  return NextResponse.json(result);
}
