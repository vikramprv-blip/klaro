import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { type, data, context } = await req.json();
  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) return NextResponse.json({ error: "No AI key configured" }, { status: 500 });

  const prompts: Record<string, string> = {
    transaction_pattern: `You are a forensic accountant. Analyze these financial transactions for fraud indicators including round-tripping, layering, structuring, unusual timing, related-party issues, over/under-invoicing and any FATF red flags. Provide a structured JSON response with: risk_level (low/medium/high/critical), flags (array of specific concerns), explanation (brief), and recommendations (array). Transactions: ${JSON.stringify(data)}`,
    finding_analysis: `You are a forensic audit expert following ACFE methodology and IFAC ISA 240. Analyze this finding and provide: severity_assessment (low/medium/high/critical), potential_fraud_schemes (array), control_weaknesses (array), legal_implications (brief), and recommended_actions (array). Finding: ${JSON.stringify(data)}`,
    interview_summary: `You are a forensic investigator. Summarize this interview and identify: key_admissions (array), inconsistencies (array), follow_up_questions (array), risk_indicators (array). Interview notes: ${JSON.stringify(data)}`,
    aml_risk: `You are an AML compliance officer trained in FATF recommendations. Assess the AML/KYC risk of this entity and provide: overall_risk (low/medium/high/critical), red_flags (array), required_due_diligence (array), screening_recommendations (array). Entity data: ${JSON.stringify(data)}`,
    report_draft: `You are a forensic audit report writer. Using this engagement data, draft a professional executive summary following ACFE/IIA standards. Be factual, concise and legally defensible. Engagement: ${JSON.stringify(data)}`,
  };

  const prompt = prompts[type] || prompts.finding_analysis;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a world-class forensic auditor and fraud investigator. Always respond in valid JSON only, no markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })
  });
  const result = await res.json();
  const text = result.choices?.[0]?.message?.content || "{}";
  try {
    return NextResponse.json({ result: JSON.parse(text) });
  } catch {
    return NextResponse.json({ result: { explanation: text } });
  }
}
