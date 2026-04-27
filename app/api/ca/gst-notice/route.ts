import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAiUsage } from "@/lib/logAiUsage";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM = `You are an expert Indian CA specialising in GST, Income Tax and TDS notices. Analyse the notice provided and respond ONLY with valid JSON (no markdown):
{
  "notice_type": "GST/IT/TDS",
  "section": "section number",
  "tax_period": "period mentioned",
  "demand_amount": number or 0,
  "response_deadline": "date if mentioned",
  "key_issues": ["issue 1", "issue 2"],
  "documents_required": ["doc 1", "doc 2"],
  "risk_level": "low/medium/high",
  "recommended_action": "brief action",
  "draft_response_points": ["point 1", "point 2", "point 3"],
  "summary": "2-3 sentence summary"
}`;

export async function GET() {
  const { data, error } = await supabase
    .from("ca_gst_notices")
    .select("*")
    .eq("firm_id", FIRM)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notices: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { client_name, gstin, notice_text, analyse } = body;

  let ai_analysis = null;
  let draft_response = "";
  let notice_type = body.notice_type || "";
  let section = body.section || "";
  let demand_amount = body.demand_amount || 0;
  let response_due = body.response_due || null;

  if (analyse && notice_text) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL, max_tokens: 1500, temperature: 0.1,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: `Analyse this notice:\n\n${notice_text}` }]
      })
    });
    const data = await res.json();
    const txt = data.choices?.[0]?.message?.content || "{}";
    logAiUsage({ feature: "gst-notice-ai", model: MODEL, tokens_used: data.usage?.total_tokens || 0 });
    try {
      ai_analysis = JSON.parse(txt);
      notice_type = ai_analysis.notice_type || notice_type;
      section = ai_analysis.section || section;
      demand_amount = ai_analysis.demand_amount || demand_amount;
      if (ai_analysis.response_deadline) response_due = ai_analysis.response_deadline;
      draft_response = ai_analysis.draft_response_points?.join("\n\n") || "";
    } catch { ai_analysis = { raw: txt }; }
  }

  const { data, error } = await supabase
    .from("ca_gst_notices")
    .insert([{
      firm_id: FIRM, client_name, gstin, notice_type, section,
      notice_text, ai_analysis, draft_response, demand_amount,
      response_due, status: "pending",
      tax_period: body.tax_period || ai_analysis?.tax_period || ""
    }])
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, status, draft_response } = await req.json();
  const { data, error } = await supabase
    .from("ca_gst_notices")
    .update({ status, draft_response, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
