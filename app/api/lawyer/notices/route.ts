import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAiUsage } from "@/lib/logAiUsage";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const NOTICE_TEMPLATES: Record<string, string> = {
  "Section 138 NI Act": `You are an Indian lawyer drafting a legal notice under Section 138 of the Negotiable Instruments Act, 1881 for cheque dishonour. Draft a formal legal notice demanding payment within 15 days. Include: (1) date of cheque, (2) cheque number, (3) bank, (4) amount, (5) reason for dishonour, (6) demand for payment within 15 days from receipt. Use formal legal language. Respond ONLY with the notice text, no preamble.`,
  "Section 8 IBC": `You are an Indian lawyer drafting a demand notice under Section 8 of the Insolvency and Bankruptcy Code, 2016 for operational debt. Draft a formal demand notice. Include: debt amount, date of default, nature of operational debt, demand for payment within 10 days. Respond ONLY with the notice text.`,
  "Consumer Notice": `You are an Indian lawyer drafting a legal notice under the Consumer Protection Act, 2019. Draft a formal notice to the opposite party regarding deficiency in service / defective goods. Include: nature of complaint, amount of compensation sought, demand for resolution within 15 days before filing complaint. Respond ONLY with the notice text.`,
  "RERA Notice": `You are an Indian lawyer drafting a legal notice under the Real Estate (Regulation and Development) Act, 2016. Draft a formal notice to a builder/developer regarding delay in possession / defect in construction. Include: project details, date of agreement, promised possession date, actual delay, amount of compensation. Respond ONLY with the notice text.`,
  "Property Dispute": `You are an Indian lawyer drafting a legal notice regarding a property dispute. Draft a formal notice claiming right/title to property, demanding vacation/handover within 30 days. Include property description, basis of claim, demand. Respond ONLY with the notice text.`,
  "Employment Notice": `You are an Indian lawyer drafting a legal notice regarding employment dispute — wrongful termination / non-payment of dues. Draft a formal notice demanding reinstatement or payment of dues within 15 days. Respond ONLY with the notice text.`,
  "Custom": `You are an Indian lawyer. Draft a formal legal notice based on the facts provided. Use proper legal language, include demand and timeline for response. Respond ONLY with the notice text.`,
};

export async function GET() {
  const { data, error } = await supabase
    .from("legal_notices")
    .select("*, legal_matters(matter_title, client_name)")
    .eq("firm_id", FIRM)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notices: data || [], types: Object.keys(NOTICE_TEMPLATES) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { matter_id, notice_type, addressee_name, addressee_addr, subject, facts, generate } = body;

  let draft_content = body.draft_content || "";

  if (generate && facts) {
    const systemPrompt = NOTICE_TEMPLATES[notice_type] || NOTICE_TEMPLATES["Custom"];
    const userMsg = `Facts: ${facts}\nAddressee: ${addressee_name}, ${addressee_addr || ""}\nSubject: ${subject}`;

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, temperature: 0.2,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMsg }]
      })
    });
    const data = await res.json();
    draft_content = data.choices?.[0]?.message?.content || "";
    logAiUsage({ feature: "legal-notice-generator", model: MODEL, tokens_used: data.usage?.total_tokens || 0 });
  }

  const { data, error } = await supabase
    .from("legal_notices")
    .insert([{ firm_id: FIRM, matter_id, notice_type, addressee_name, addressee_addr, subject, draft_content, status: "draft" }])
    .select("*, legal_matters(matter_title, client_name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, draft_content, status } = await req.json();
  const { data, error } = await supabase
    .from("legal_notices")
    .update({ draft_content, status, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
