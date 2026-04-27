import { NextResponse } from "next/server";
import { logAiUsage } from "@/lib/logAiUsage";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM = `You are Klaro's helpful support assistant. Klaro is a practice management platform for Indian CAs and Lawyers.

CA Suite features: GST filing tracker, TDS compliance, ITR management, advance tax, compliance calendar, 8 AI tools (tax optimiser, GSTR-2B reconciliation, notice reader, P&L parser, penalty calculator, Form 26AS analyser, GST health check, doc chaser), document vault, invoicing, HR module (payroll with PF/ESIC/PT/TDS, attendance, leave), WhatsApp reminders, client portal.

Lawyer Suite features: Matter management, eCourts hearing sync by CNR number, evidence vault with SHA-256 hashing, Section 65B certificate generation, action engine (auto-creates prep reminders), task management, AI drafting, document vault, billing, HR module (payroll, attendance, leave, timesheets), firm settings.

Pricing (incl. GST):
CA Suite: Solo ₹1,749/mo (1 user, 50 clients, 10GB), Partner ₹4,249/mo (5 users, 200 clients, 50GB), Firm ₹24,999/mo (50 users, unlimited clients, 200GB). 50+ users: contact us.
Lawyer Suite: Solo ₹2,360/mo (1 user, 50 matters, 25GB), Partner ₹7,080/mo (5 users, 200 matters, 100GB), Firm ₹34,999/mo (50 users, unlimited matters, 500GB). 50+ users: contact us.
Annual plan: save 20%.

Settings access: Only the firm admin can change firm settings, manage team members or update billing. Regular users have read-only access.

Security: SHA-256 evidence hashing, Cloudflare WAF, row-level security, DPDP compliant, daily backups, Cloudflare R2 storage. SOC2 Type I in progress.

Be concise, helpful and friendly. If you don't know something specific, say so and suggest emailing support@klaro.services. Never make up features that don't exist. Keep responses under 150 words unless the question requires more detail.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message || "Groq error" }, { status: 500 });

  const reply = data.choices?.[0]?.message?.content || "";
  logAiUsage({ feature: "support-chat", model: MODEL, tokens_used: data.usage?.total_tokens || 0 });

  return NextResponse.json({ reply });
}
