import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

const DOC_TYPES = ["Form 16 / 16A", "ITR Acknowledgement", "Financial Statements", "Audit Report", "GST Return", "Board Resolution", "Client Agreement", "Letter of Engagement", "Power of Attorney", "Other"];

async function sendEsignRequest(to: string, name: string, docName: string, requestId: string) {
  if (!RESEND_KEY) return { sent: false };
  const signUrl = `https://klaro.services/esign/${requestId}`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({
      from: "Klaro <noreply@klaro.services>",
      to,
      subject: `Action required: Please sign ${docName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:#1B3A5C;padding:16px 24px;border-radius:8px 8px 0 0">
            <h1 style="color:white;margin:0;font-size:18px">Document Signature Required</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            <p style="font-size:14px;color:#374151">Dear ${name},</p>
            <p style="font-size:14px;color:#374151">Your CA has requested your signature on the following document:</p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
              <p style="margin:4px 0;font-size:14px;font-weight:bold">${docName}</p>
            </div>
            <p style="font-size:14px;color:#374151">Please click the button below to review and sign the document using Aadhaar OTP e-sign:</p>
            <a href="${signUrl}" style="display:inline-block;background:#1B3A5C;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;margin-top:8px">Review and Sign →</a>
            <p style="font-size:12px;color:#9ca3af;margin-top:16px">This e-signature is legally valid under the Information Technology Act, 2000. If you did not expect this request, please contact your CA immediately.</p>
          </div>
        </div>
      `
    })
  });
  return { sent: true };
}

export async function GET() {
  const { data, error } = await supabase
    .from("esign_requests").select("*").eq("firm_id", FIRM)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data || [], doc_types: DOC_TYPES });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { document_name, document_type, signer_name, signer_email, signer_phone, notes, send_email } = body;

  const { data, error } = await supabase
    .from("esign_requests")
    .insert([{ firm_id: FIRM, document_name, document_type, signer_name, signer_email, signer_phone, notes, status: "pending", provider: "manual" }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let emailSent = false;
  if (send_email && signer_email) {
    const result = await sendEsignRequest(signer_email, signer_name, document_name, data.id);
    emailSent = result.sent;
  }

  return NextResponse.json({ ...data, email_sent: emailSent });
}

export async function PATCH(req: Request) {
  const { id, status, signed_at, notes } = await req.json();
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (status === "signed") updates.signed_at = signed_at || new Date().toISOString();
  if (notes) updates.notes = notes;
  const { data, error } = await supabase
    .from("esign_requests").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
