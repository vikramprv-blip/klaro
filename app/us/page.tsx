import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Klaro — Practice Management for US Lawyers & CPAs",
  description: "Klaro eliminates blocker blindness between law firms and CPA firms. AI-powered practice management with cross-firm collaboration, predictive AI (Klaro Sentinel), and audit-ready compliance trails. Trusted by attorneys and accountants across the United States.",
  alternates: { canonical: "https://klaro.services/us" },
}

const LAWYER_FEATURES = [
  { icon: "⚖", title: "Matter & Case Management", desc: "Full matter lifecycle — intake, deadlines, court dates, documents, billing. Everything in one place, not five apps." },
  { icon: "🔗", title: "Cross-Firm Blocker Dashboard", desc: "When your CPA hasn't finished the audit, your closing task auto-flags as BLOCKED with a countdown. No more chasing emails." },
  { icon: "📋", title: "Audit-Ready Compliance Trail", desc: "Every decision logged with who made it, what document triggered it, and when. Malpractice protection built in." },
  { icon: "🤖", title: "Klaro Sentinel AI", desc: "Predicts delays before they happen. 'This M&A matter is running 4 days behind similar matters. 3 tasks need reassignment.'" },
  { icon: "⏱", title: "Time & Billing", desc: "Track billable hours, generate invoices, manage trust accounts. IOLTA-aware billing built for US law firms." },
  { icon: "📁", title: "Secure Document Vault", desc: "Client documents with version control, e-signature requests, and chain of custody logging for litigation support." },
]

const CPA_FEATURES = [
  { icon: "📊", title: "Tax Workflow Management", desc: "Track 1040, 1120, 1065, 990 returns. Automated deadline alerts for extension deadlines and IRS due dates." },
  { icon: "🔗", title: "Shared Client Workspace", desc: "Work with the client's attorney on the same matter. No more emailing PDFs back and forth or version conflicts." },
  { icon: "🤖", title: "AI Anomaly Detection", desc: "'This client's tax prep is 30% longer than average for their industry. AI suggests a missing Schedule K-1.' Fix before it's late." },
  { icon: "📄", title: "Document Request Tracker", desc: "PBC lists with client portal. Clients upload directly, you get notified. Stop chasing missing documents." },
  { icon: "🔍", title: "1099 & W-2 Management", desc: "Track issuance, corrections, and filing status for all contractor and employee filings in one dashboard." },
  { icon: "🛡", title: "IRS Compliance Audit Trail", desc: "Complete decision log for every return. Who reviewed it, what changed, when it was signed. IRS-ready in minutes." },
]

const PLANS = [
  {
    name: "Foundation",
    price: "$59",
    unit: "/user/mo",
    annual: "$49/user/mo billed annually",
    target: "Solo practitioners & small firms",
    color: "border-gray-200",
    highlight: false,
    features: [
      "Up to 5 users",
      "Unlimited matters & cases",
      "Document vault (25 GB)",
      "Time tracking & invoicing",
      "Client portal",
      "Email support",
      "14-day free trial",
    ],
  },
  {
    name: "Professional",
    price: "$449",
    unit: "/mo base",
    annual: "$379/mo billed annually",
    target: "Growing law & CPA firms",
    color: "border-gray-900",
    highlight: true,
    badge: "Most popular",
    features: [
      "Everything in Foundation",
      "Up to 25 users",
      "+ $8 per active matter",
      "Klaro Sentinel AI",
      "Cross-firm collaboration",
      "Audit-ready compliance trail",
      "Document vault (250 GB)",
      "Priority support",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    annual: "Outcome-based pricing available",
    target: "Multi-office & national firms",
    color: "border-gray-200",
    highlight: false,
    features: [
      "Everything in Professional",
      "Unlimited users & matters",
      "Custom AI model training",
      "White-label option",
      "Dedicated success manager",
      "SLA guarantee",
      "On-premise option",
      "SSO / SAML",
    ],
  },
]

const FAQS = [
  { q: "How is Klaro different from Clio or MyCase?", a: "Clio and MyCase are excellent law firm tools — but they're silos. Klaro is built for the reality that lawyers and CPAs work together on clients. Our Cross-Firm Blocker Dashboard and Klaro Sentinel AI address the #1 complaint of US professional services: inefficiency from fragmented communication between firms." },
  { q: "What is Klaro Sentinel?", a: "Klaro Sentinel is our predictive AI that analyzes your past matter timelines and identifies hidden latency before it becomes a problem. It tells you things like: 'Your paralegal team is over-capacity — this M&A deal will be delayed by 4 days unless 2 tasks are reassigned.' No other legal software does this." },
  { q: "Is my client data secure?", a: "Yes. Data is hosted in US-East (AWS), encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II in progress. HIPAA-ready infrastructure available on Enterprise. We never train AI models on your client data." },
  { q: "Can we import data from our existing software?", a: "Yes. We offer white-glove migration from Clio, MyCase, PracticePanther, QuickBooks, and most legacy systems. Our team handles the move with a Migration Guarantee — if anything is lost, we fix it at no charge." },
  { q: "How does the cross-firm collaboration work?", a: "You invite the other firm (e.g., your client's CPA) to a shared workspace for that client. They see only what you share. When their task is blocked, your tasks automatically get flagged. No new logins, no app switching — it works inside Klaro." },
  { q: "What does 'per active matter' mean in Professional?", a: "An active matter is any case, deal, or engagement where at least one task was updated in the billing month. Closed matters don't count. Average Professional firm has 20–40 active matters, making the effective cost $609–$769/mo for a full team." },
]

export default function USHomePage() {
  return (
    <main>
      {/* Schema.org structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Klaro",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": "AI-powered practice management for US lawyers and CPAs. Cross-firm collaboration, predictive AI, and audit-ready compliance trails.",
        "url": "https://klaro.services/us",
        "offers": [
          { "@type": "Offer", "name": "Foundation", "price": "59", "priceCurrency": "USD", "priceSpecification": { "@type": "UnitPriceSpecification", "unitCode": "MON" } },
          { "@type": "Offer", "name": "Professional", "price": "449", "priceCurrency": "USD" },
        ],
        "provider": { "@type": "Organization", "name": "Klaro Tech", "url": "https://klaro.services" },
      }) }} />

      {/* HERO */}
      <section className="bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 px-4 py-1.5 rounded-full text-sm text-blue-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Now in early access · US attorneys & CPAs
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Stop losing deals to<br />
              <span className="text-blue-400">blocker blindness</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl leading-relaxed">
              When your lawyer is waiting on the audit and your CPA is waiting on the signed contract — and neither knows the other is stuck — that's blocker blindness. Klaro fixes it.
            </p>
            <p className="mt-3 text-gray-400 max-w-xl">
              AI-powered practice management for US law firms and CPA firms. Cross-firm collaboration, predictive delay detection, and audit-ready compliance trails.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/us/signup"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors">
                Start 14-day free trial
              </Link>
              <Link href="#demo"
                className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3.5 rounded-xl font-medium text-base transition-colors">
                See how it works →
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">No credit card required · Cancel anytime · White-glove migration included</p>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-800 pt-12">
            {[
              { value: "4.2h", label: "saved per attorney per week" },
              { value: "31%", label: "faster matter close times" },
              { value: "$0", label: "migration cost (guaranteed)" },
              { value: "99.9%", label: "uptime SLA on Enterprise" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section id="demo" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">The $2.4 trillion coordination problem</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">US professional services firms lose an estimated 23% of billable time to inter-firm coordination failures. Klaro is the first platform built specifically to solve this.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "😤", title: "The Lawyer's problem", desc: "Waiting on the CPA for the audit report before closing. No visibility into when it's coming. Deal deadline slipping.", color: "bg-red-50 border-red-100" },
              { icon: "😩", title: "The CPA's problem", desc: "Waiting on the attorney for the signed engagement letter before starting. Three emails sent. Radio silence.", color: "bg-amber-50 border-amber-100" },
              { icon: "😰", title: "The Client's problem", desc: "Paying both firms to wait on each other. Getting invoiced for the inefficiency they can't even see.", color: "bg-orange-50 border-orange-100" },
            ].map(p => (
              <div key={p.title} className={`${p.color} border rounded-2xl p-6`}>
                <p className="text-3xl mb-3">{p.icon}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-gray-900 text-white rounded-2xl p-8 text-center">
            <p className="text-lg font-semibold mb-2">Klaro connects both firms in a shared workspace</p>
            <p className="text-gray-400 text-sm">When the CPA marks their task as blocked, the lawyer's closing task auto-flags as HIGH PRIORITY. No emails. No calls. Automatic.</p>
          </div>
        </div>
      </section>

      {/* FEATURES — LAWYERS */}
      <section id="lawyers" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">For Law Firms</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Everything your firm needs — minus the admin fatigue</h2>
            <p className="text-gray-500 mt-2 max-w-2xl">Built for US attorneys. IOLTA-aware billing, malpractice-protection audit trails, and AI that predicts problems before they become malpractice claims.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LAWYER_FEATURES.map(f => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <p className="text-2xl mb-3">{f.icon}</p>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES — CPAs */}
      <section id="cpas" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600">For CPA Firms</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Stop chasing documents. Start closing returns.</h2>
            <p className="text-gray-500 mt-2 max-w-2xl">Tax season capacity planning, automated PBC tracking, and AI that tells you a return is going sideways before the deadline hits.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CPA_FEATURES.map(f => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <p className="text-2xl mb-3">{f.icon}</p>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KLARO SENTINEL */}
      <section id="sentinel" className="py-20 bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Klaro Sentinel AI</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">The AI that manages your firm's health — not just your tasks</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Everyone has AI that summarizes text. Klaro Sentinel is different — it predicts friction. It analyzes your past matter timelines, team capacity, and client patterns to surface problems before they become disasters.
              </p>
              <div className="space-y-4">
                {[
                  { label: "For Law Firms", text: "Warning: Based on previous M&A filings in New York, your paralegal team is over-capacity. This deal will likely be delayed by 4 days unless 2 tasks are reassigned." },
                  { label: "For CPA Firms", text: "Anomaly detected: This client's tax prep is taking 30% longer than average for their industry. AI suggests a missing Schedule K-1 based on similar historical patterns." },
                  { label: "Cross-Firm", text: "Blocker alert: The audit report from Greene & Associates is now 6 days late. Your closing deadline is in 9 days. Escalation recommended." },
                ].map(e => (
                  <div key={e.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">{e.label}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">"{e.text}"</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Sentinel Dashboard</h3>
                <div className="space-y-3">
                  {[
                    { label: "M&A — Acme Corp", status: "At risk", detail: "4 days behind pace", color: "text-red-400 bg-red-900/20" },
                    { label: "Estate Plan — Johnson", status: "On track", detail: "2 days ahead", color: "text-green-400 bg-green-900/20" },
                    { label: "1120 — TechStart Inc", status: "Anomaly", detail: "Missing K-1 suspected", color: "text-amber-400 bg-amber-900/20" },
                    { label: "Litigation — Smith v Brown", status: "Blocked", detail: "Waiting on expert report", color: "text-orange-400 bg-orange-900/20" },
                    { label: "1040 — Rivera Family", status: "On track", detail: "Day 3 of 8", color: "text-green-400 bg-green-900/20" },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div>
                        <p className="text-sm text-white font-medium">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.detail}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${m.color}`}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">Available on Professional & Enterprise plans</p>
            </div>
          </div>
        </div>
      </section>

      {/* CROSS-FIRM */}
      <section id="crossfirm" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Cross-Firm Collaboration</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">The first platform built for multi-disciplinary client work</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-12">Law firms and CPA firms increasingly work on the same clients — M&A, estate planning, tax defense, business formation. Klaro is the shared workspace that connects them.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { step: "01", title: "Invite the other firm", desc: "Send a secure workspace invitation to your client's attorney or CPA. They accept in one click — no new software to learn.", icon: "📨" },
              { step: "02", title: "Link your blockers", desc: "Connect your tasks to theirs. When their audit is late, your closing automatically flags. Real-time, automatic, no emails.", icon: "🔗" },
              { step: "03", title: "Close faster together", desc: "Both firms see the shared timeline. Sentinel AI monitors both sides. Deals close faster. Clients are happier. Everyone bills more.", icon: "✅" },
            ].map(s => (
              <div key={s.step} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-gray-400">{s.step}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-2">No per-seat surprises on Enterprise. No hidden fees. White-glove migration included on all plans.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div key={plan.name} className={`bg-white border-2 ${plan.color} rounded-2xl p-6 relative ${plan.highlight ? "shadow-lg" : ""}`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">{plan.badge}</span>
                )}
                <p className="text-sm font-semibold text-gray-500 mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.unit}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{plan.annual}</p>
                <p className="text-xs text-gray-500 mb-5">{plan.target}</p>
                <Link href="/us/signup"
                  className={`block text-center py-2.5 rounded-xl text-sm font-semibold mb-5 transition-colors ${plan.highlight ? "bg-gray-900 text-white hover:bg-gray-700" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                  {plan.price === "Custom" ? "Contact sales" : "Start free trial"}
                </Link>
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 max-w-5xl mx-auto text-center">
            <p className="text-sm text-blue-800"><strong>White-glove migration guarantee:</strong> We migrate your data from Clio, MyCase, PracticePanther, QuickBooks, or any legacy system — free. If anything is lost or wrong, we fix it at no charge.</p>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">How Klaro compares</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-gray-500 font-medium">Feature</th>
                  <th className="text-center py-3 font-bold text-gray-900">Klaro</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Clio</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Karbon</th>
                  <th className="text-center py-3 text-gray-400 font-medium">MyCase</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Law firm management", "✅", "✅", "❌", "✅"],
                  ["CPA / accounting workflows", "✅", "❌", "✅", "❌"],
                  ["Cross-firm collaboration", "✅", "❌", "❌", "❌"],
                  ["Predictive AI (Sentinel)", "✅", "❌", "❌", "❌"],
                  ["Blocker auto-escalation", "✅", "❌", "❌", "❌"],
                  ["Audit-ready compliance trail", "✅", "Partial", "Partial", "❌"],
                  ["Per-matter pricing option", "✅", "❌", "❌", "❌"],
                  ["White-glove migration", "✅", "❌", "❌", "❌"],
                ].map(([feature, ...vals]) => (
                  <tr key={feature as string} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-700">{feature}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`py-3 text-center ${i === 0 ? "font-bold text-gray-900" : "text-gray-400"}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <details key={faq.q} className="bg-white border border-gray-200 rounded-xl group">
                <summary className="px-5 py-4 cursor-pointer font-medium text-gray-900 flex justify-between items-center list-none">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to eliminate blocker blindness?</h2>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">Join law firms and CPA firms who are closing matters faster, billing more, and keeping clients happier with Klaro.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/us/signup"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors">
              Start your 14-day free trial
            </Link>
            <a href="mailto:us@klaro.services"
              className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-3.5 rounded-xl font-medium text-base transition-colors">
              Talk to sales
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-500">No credit card required · White-glove migration included · Cancel anytime</p>
        </div>
      </section>
    </main>
  )
}
