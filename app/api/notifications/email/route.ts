import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const RESEND_KEY = process.env.RESEND_API_KEY || "";
const FROM = "Klaro Tech <contact@klaro.services>";

const COMPANY = {
  name: "Klaro Tech",
  owner: "Vikram Chawla",
  address: "III 5/47 Shams Singh Street, Gopinath Bazar, Delhi Cantt",
  city: "New Delhi 110 010",
  country: "India",
  phone: "+91 9711196770",
  email: "contact@klaro.services",
  gstin: "07ABIPC4672R1Z4",
  pan: "ABIPC4672R",
  type: "Proprietorship",
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) { console.log(`[EMAIL SKIP] ${to} | ${subject}`); return { success: false }; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({ from: FROM, to, subject, html })
  });
  return { success: res.ok, data: await res.json() };
}

function invoiceHTML(opts: { invoice_no: string; date: string; customer_name: string; customer_email: string; plan: string; amount_excl_gst: number; gst: number; total: number; period: string }) {
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;margin:0;padding:0;background:#f5f5f5}
.wrap{max-width:700px;margin:20px auto;background:white;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden}
.header{background:#1B3A5C;padding:24px 32px;display:flex;justify-content:space-between;align-items:center}
.logo{color:white;font-size:22px;font-weight:bold;letter-spacing:-0.5px}
.inv-title{color:#94a3b8;font-size:12px;text-align:right}
.inv-no{color:white;font-size:16px;font-weight:bold}
.body{padding:32px}
.row{display:flex;justify-content:space-between;gap:24px;margin-bottom:24px}
.col{flex:1}
.label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
.value{font-size:13px;color:#1a1a1a;line-height:1.5}
table{width:100%;border-collapse:collapse;margin:24px 0}
th{background:#f8fafc;padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb}
td{padding:12px 16px;border-bottom:1px solid #f1f5f9}
.total-row td{font-weight:bold;font-size:14px;background:#f0f9ff}
.gst-note{background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;font-size:11px;color:#6b7280;margin-top:8px}
.footer{background:#f8fafc;padding:16px 32px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrap">
  <div class="header">
    <div class="logo">KLARO</div>
    <div class="inv-title">TAX INVOICE<br><span class="inv-no">${opts.invoice_no}</span></div>
  </div>
  <div class="body">
    <div class="row">
      <div class="col">
        <div class="label">From</div>
        <div class="value">
          <strong>${COMPANY.name}</strong><br>
          ${COMPANY.owner}<br>
          ${COMPANY.address}<br>
          ${COMPANY.city}<br>
          ${COMPANY.country}<br>
          GSTIN: ${COMPANY.gstin}<br>
          PAN: ${COMPANY.pan}<br>
          ${COMPANY.type}
        </div>
      </div>
      <div class="col">
        <div class="label">Bill To</div>
        <div class="value">
          <strong>${opts.customer_name}</strong><br>
          ${opts.customer_email}
        </div>
        <div style="margin-top:16px">
          <div class="label">Invoice Date</div>
          <div class="value">${opts.date}</div>
        </div>
        <div style="margin-top:12px">
          <div class="label">Subscription Period</div>
          <div class="value">${opts.period}</div>
        </div>
      </div>
    </div>
    <table>
      <thead><tr><th>Description</th><th>HSN/SAC</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Klaro ${opts.plan} — Practice Management Software</td><td>998313</td><td>₹${opts.amount_excl_gst.toLocaleString("en-IN")}</td></tr>
        <tr><td>IGST @ 18%</td><td></td><td>₹${opts.gst.toLocaleString("en-IN")}</td></tr>
      </tbody>
      <tfoot><tr class="total-row"><td colspan="2">Total Payable</td><td>₹${opts.total.toLocaleString("en-IN")}</td></tr></tfoot>
    </table>
    <div class="gst-note">
      ⓘ This is a computer-generated invoice. SAC code 998313 — Software as a Service (SaaS). IGST applicable as an interstate supply.
      Payment made via UPI is deemed acceptance of Klaro's Terms of Service at klaro.services/terms.
    </div>
  </div>
  <div class="footer">
    Klaro Tech · contact@klaro.services · +91 9711196770 · klaro.services<br>
    GSTIN: 07ABIPC4672R1Z4 · Delhi Cantt, New Delhi 110 010
  </div>
</div>
</body></html>`;
}

function welcomeHTML(name: string, plan: string, vertical: string) {
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;background:#f5f5f5;margin:0;padding:0}
.wrap{max-width:600px;margin:20px auto;background:white;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0}
.header{background:#1B3A5C;padding:24px 32px}
.logo{color:white;font-size:22px;font-weight:bold}
.body{padding:32px}
.btn{display:inline-block;background:#1B3A5C;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;margin-top:16px}
.footer{background:#f8fafc;padding:16px 32px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrap">
  <div class="header"><div class="logo">KLARO</div></div>
  <div class="body">
    <h2 style="margin-top:0">Welcome to Klaro, ${name}!</h2>
    <p>Your <strong>${plan}</strong> account is now active. You have access to the full ${vertical === "ca" ? "CA Suite" : "Lawyer Suite"} — ${vertical === "ca" ? "GST, TDS, ITR, AI tools, HR, invoicing and more" : "matter management, eCourts sync, evidence vault, Section 65B certificates, AI drafting and more"}.</p>
    <p>Get started in under 10 minutes:</p>
    <ol style="line-height:2">
      ${vertical === "ca" ? `<li>Add your first client</li><li>Set up GST filing tracker</li><li>Try the Tax Optimiser AI tool</li>` : `<li>Create your first matter</li><li>Add hearing dates</li><li>Upload evidence to the vault</li>`}
    </ol>
    <a href="https://klaro.services/${vertical === "ca" ? "in/ca" : "in/lawyer"}" class="btn">Open ${vertical === "ca" ? "CA" : "Lawyer"} Suite →</a>
    <p style="margin-top:24px;font-size:12px;color:#6b7280">Need help? Email us at contact@klaro.services or use the support chat inside the platform.</p>
  </div>
  <div class="footer">Klaro Tech · contact@klaro.services · +91 9711196770 · klaro.services<br>GSTIN: 07ABIPC4672R1Z4</div>
</div>
</body></html>`;
}

function hearingReminderHTML(hearing: any, firm: any) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1B3A5C;padding:16px 24px;border-radius:8px 8px 0 0">
    <h1 style="color:white;margin:0;font-size:18px">Hearing Reminder — Klaro</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="font-size:14px;color:#374151">Dear ${firm?.name || "Team"},</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:4px 0;font-size:13px"><strong>Matter:</strong> ${hearing.legal_matters?.matter_title || "—"}</p>
      <p style="margin:4px 0;font-size:13px"><strong>Client:</strong> ${hearing.legal_matters?.client_name || "—"}</p>
      <p style="margin:4px 0;font-size:13px"><strong>Date:</strong> ${hearing.hearing_date}</p>
      <p style="margin:4px 0;font-size:13px"><strong>Court:</strong> ${hearing.court_name || "—"}</p>
      <p style="margin:4px 0;font-size:13px"><strong>Purpose:</strong> ${hearing.purpose || "—"}</p>
    </div>
    <a href="https://klaro.services/in/lawyer/hearings" style="display:inline-block;background:#1B3A5C;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px">View in Klaro →</a>
    <p style="font-size:11px;color:#9ca3af;margin-top:16px">Klaro Tech · contact@klaro.services · GSTIN: 07ABIPC4672R1Z4</p>
  </div>
</div>`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { type, to, data, firm_id } = body;

  const { data: firm } = await supabase.from("firms").select("name, email").eq("id", firm_id || "00000000-0000-0000-0000-000000000001").single();

  let subject = "", html = "";

  switch (type) {
    case "welcome":
      subject = `Welcome to Klaro — your ${data.plan} account is active`;
      html = welcomeHTML(data.name, data.plan, data.vertical || "ca");
      break;

    case "invoice": {
      const total = Number(data.total || 0);
      const gst = Math.round(total * 18 / 118);
      const excl = total - gst;
      const now = new Date();
      const invoice_no = `KL-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}-${String(Math.floor(Math.random()*9000)+1000)}`;
      const date = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
      const period = `${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`;
      subject = `Invoice ${invoice_no} — Klaro ${data.plan} Subscription`;
      html = invoiceHTML({ invoice_no, date, customer_name: data.name, customer_email: to, plan: data.plan, amount_excl_gst: excl, gst, total, period });
      // Store invoice in audit log
      await supabase.from("audit_logs").insert([{ firm_id: firm_id || "00000000-0000-0000-0000-000000000001", action: "invoice_sent", entity_type: "invoice", entity_name: invoice_no, new_value: { to, plan: data.plan, total, invoice_no } }]);
      break;
    }

    case "hearing_reminder":
      subject = `Hearing Reminder: ${data.legal_matters?.client_name || "Matter"} — ${data.hearing_date}`;
      html = hearingReminderHTML(data, firm);
      break;

    case "deadline_reminder":
      subject = `Compliance Deadline: ${data.title} — ${data.due_date}`;
      html = `<div style="font-family:Arial,sans-serif;padding:24px"><h2>${data.title}</h2><p>Due: <strong>${data.due_date}</strong></p><a href="https://klaro.services/in/ca/deadlines" style="background:#1B3A5C;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">View Deadlines →</a></div>`;
      break;

    default:
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  }

  const result = await sendEmail(to, subject, html);
  return NextResponse.json(result);
}
