import Link from "next/link";

const CA_FEATURES = [
  { icon: "📋", title: "GST Filing Tracker", desc: "GSTR-1, 3B, 9 — track every client's status in one view. Auto-reminders before due dates.", href: "/in/ca/gst" },
  { icon: "📊", title: "TDS Compliance", desc: "Form 24Q, 26Q, 27Q. Generate challan tracking, update filed dates, never miss a quarter.", href: "/in/ca/tds" },
  { icon: "🗂", title: "ITR Management", desc: "Auto-select ITR form by entity type. 5-stage workflow from docs pending to filed.", href: "/in/ca/itr" },
  { icon: "💰", title: "Advance Tax", desc: "All 4 instalments auto-generated per client per AY. Mark paid with challan numbers.", href: "/in/ca/advance-tax" },
  { icon: "📅", title: "Compliance Deadlines", desc: "FY 2026-27 calendar pre-loaded. GST, TDS, ITR, ROC — colour-coded by urgency.", href: "/in/ca/deadlines" },
  { icon: "🤖", title: "8 AI Tools", desc: "Tax optimiser, GST health check, GSTR-2B reconciliation, notice reader, P&L parser and more.", href: "/in/ca/ai/tax-optimiser" },
  { icon: "📁", title: "Document Vault", desc: "Upload, index and AI-search all client documents. Semantic search finds what you need instantly.", href: "/in/ca/documents" },
  { icon: "🧾", title: "Invoicing", desc: "GST-compliant invoices with auto numbering, PDF generation and WhatsApp delivery.", href: "/in/ca/invoices" },
  { icon: "👥", title: "HR Module", desc: "Payroll with PF/ESIC/PT/TDS deductions, attendance, leave management and payslip delivery.", href: "/in/ca/hr" },
  { icon: "💬", title: "WhatsApp Reminders", desc: "Auto-chase clients for documents. AI drafts the message, you approve and send.", href: "/in/ca/followups" },
];

const LAWYER_FEATURES = [
  { icon: "⚖️", title: "Matter Management", desc: "Full case lifecycle — client, CNR number, court, opposing party, priority and status.", href: "/in/lawyer/matters" },
  { icon: "🏛", title: "eCourts Hearing Sync", desc: "Auto-sync hearing dates from eCourts by CNR number. Never miss a court date again.", href: "/in/lawyer/hearings" },
  { icon: "🔐", title: "Evidence Vault + 65B", desc: "SHA-256 hashing on every file. Generate Section 65B certificates for court in one click.", href: "/in/lawyer/evidence" },
  { icon: "⚡", title: "Action Engine", desc: "AI auto-creates prep reminders, client alerts and invoice triggers from hearing changes.", href: "/in/lawyer" },
  { icon: "✅", title: "Task Management", desc: "Assign tasks to matters with due dates. Overdue tasks highlighted. Full audit trail.", href: "/in/lawyer/tasks" },
  { icon: "📝", title: "AI Drafting", desc: "Draft petitions, notices and agreements from templates. AI completes, you review.", href: "/in/lawyer/drafts" },
  { icon: "📁", title: "Document Vault", desc: "Store all matter documents with version history and secure signed download links.", href: "/in/lawyer/documents" },
  { icon: "🧾", title: "Billing", desc: "Time-based and fixed-fee invoicing. Generate GST-compliant invoices per matter.", href: "/in/lawyer/billing" },
  { icon: "👥", title: "HR Module", desc: "Manage associates, clerks and staff. Attendance, leave, payroll and timesheets.", href: "/in/lawyer/hr" },
  { icon: "⚙️", title: "Firm Settings", desc: "Company profile, Bar Council registration, GST, address and admin details.", href: "/in/lawyer/settings" },
];

const CA_PLANS = [
  {
    name: "Solo",
    base: "₹1,482", gst: "₹267", total: "₹1,749",
    annual: "₹16,790/yr",
    users: "1 user", clients: "50 clients", storage: "10 GB",
    highlight: false,
    features: ["GST, TDS, ITR, advance tax", "All AI tools", "Compliance calendar", "Document vault", "Invoicing + WhatsApp"],
  },
  {
    name: "Partner",
    base: "₹3,601", gst: "₹648", total: "₹4,249",
    annual: "₹40,790/yr",
    users: "5 users", clients: "200 clients", storage: "50 GB",
    highlight: true,
    features: ["Everything in Solo", "HR — payroll, attendance, leave", "Team roles + permissions", "Bulk client import"],
  },
  {
    name: "Firm",
    base: "₹21,186", gst: "₹3,813", total: "₹24,999",
    annual: "₹2,39,990/yr",
    users: "50 users", clients: "Unlimited clients", storage: "200 GB",
    highlight: false,
    features: ["Everything in Partner", "Multi-branch / offices", "Priority support", "Custom onboarding"],
    cta_contact: false,
  },
];

const LAWYER_PLANS = [
  {
    name: "Solo",
    base: "₹2,000", gst: "₹360", total: "₹2,360",
    annual: "₹22,660/yr",
    users: "1 user", clients: "50 matters", storage: "25 GB",
    highlight: false,
    features: ["eCourts hearing sync", "Evidence vault + 65B cert", "AI drafting + billing", "Task management"],
  },
  {
    name: "Partner",
    base: "₹6,000", gst: "₹1,080", total: "₹7,080",
    annual: "₹67,970/yr",
    users: "5 users", clients: "200 matters", storage: "100 GB",
    highlight: true,
    features: ["Everything in Solo", "HR — payroll, attendance, leave", "Advanced AI drafting", "Team roles + permissions"],
  },
  {
    name: "Firm",
    base: "₹29,660", gst: "₹5,339", total: "₹34,999",
    annual: "₹3,35,990/yr",
    users: "50 users", clients: "Unlimited matters", storage: "500 GB",
    highlight: false,
    features: ["Everything in Partner", "Full Section 65B audit trail", "Multi-branch / offices", "Priority support"],
  },
];

function FeatureGrid({ features }: { features: typeof CA_FEATURES }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {features.map((f) => (
        <Link key={f.title} href={f.href}
          className="group border border-gray-100 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
          <div className="text-2xl mb-2">{f.icon}</div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-black">{f.title}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
        </Link>
      ))}
    </div>
  );
}

function PlanCard({ plan, vertical }: { plan: typeof CA_PLANS[0]; vertical: string }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col border ${plan.highlight ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100"}`}>
      {plan.highlight && (
        <span className="text-xs font-medium bg-white/10 text-white px-3 py-1 rounded-full self-start mb-4">Most popular</span>
      )}
      <h3 className={`text-lg font-semibold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full ${plan.highlight ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{plan.users}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${plan.highlight ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{plan.clients}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${plan.highlight ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{plan.storage}</span>
      </div>
      <div className="mt-4 mb-1">
        <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.total}</span>
        <span className={`text-sm ml-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>/mo</span>
      </div>
      <p className={`text-xs mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
        {plan.base} + {plan.gst} GST (18%)
      </p>
      <p className={`text-xs mb-5 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
        {plan.annual} — save 20% annually
      </p>
      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 ${plan.highlight ? "text-green-400" : "text-green-600"}`}>✓</span>
            <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={`/signup?vertical=${vertical}&plan=${plan.name.toLowerCase()}`}
        className={`text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
          plan.highlight ? "bg-white text-gray-900 hover:bg-gray-100" : "border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}>
        Get started →
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link href="/" className="text-xl font-bold tracking-tight">Klaro</Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <Link href="#ca" className="hover:text-gray-900">CA Suite</Link>
          <Link href="#lawyer" className="hover:text-gray-900">Lawyer Suite</Link>
          <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
          <Link href="/guide" className="hover:text-gray-900">Guide</Link>
        </div>
        <div className="flex gap-2">
          <Link href="/signin" className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Sign in</Link>
          <Link href="/signup" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Built for Indian professionals</p>
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-5">
            The practice OS for<br />CAs and Lawyers.
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Klaro replaces spreadsheets, WhatsApp chases and disconnected tools with one platform built for India — GST, TDS, ITR, eCourts, evidence vault, HR and AI in a single dashboard.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/signup?vertical=ca" className="rounded-lg bg-gray-900 px-6 py-3 text-white text-sm font-medium hover:bg-gray-700">Start free — CA Suite</Link>
            <Link href="/signup?vertical=lawyer" className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium hover:bg-gray-50">Start free — Lawyer Suite</Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-8 items-center justify-between text-sm text-gray-500">
          <span>🔒 SHA-256 evidence hashing</span>
          <span>⚖️ Section 65B certified</span>
          <span>🏛 eCourts live sync</span>
          <span>🤖 8 AI tools built-in</span>
          <span>📱 WhatsApp integrated</span>
          <span>🇮🇳 DPDP compliant</span>
          <span>🛡 Cloudflare WAF protected</span>
        </div>
      </section>

      {/* CA Suite */}
      <section id="ca" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-10">
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
          <h2 className="text-3xl font-bold mt-4 mb-2">Everything a CA firm needs</h2>
          <p className="text-gray-500">From solo practitioners to 50-user firms — GST, TDS, ITR, advance tax, AI tools, HR and invoicing. Click any module to explore.</p>
        </div>
        <FeatureGrid features={CA_FEATURES} />
        <div className="mt-6 flex gap-3">
          <Link href="/in/ca" className="rounded-lg bg-blue-600 px-5 py-2.5 text-white text-sm font-medium hover:bg-blue-700">Open CA Suite →</Link>
          <Link href="/guide#ca" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50">Read the guide</Link>
        </div>
      </section>

      {/* Lawyer Suite */}
      <section id="lawyer" className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100">
        <div className="mb-10">
          <span className="text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
          <h2 className="text-3xl font-bold mt-4 mb-2">India's first complete law firm OS</h2>
          <p className="text-gray-500">eCourts sync, evidence vault with Section 65B certification, AI drafting, HR and billing — purpose-built for Indian advocates and law firms.</p>
        </div>
        <FeatureGrid features={LAWYER_FEATURES} />
        <div className="mt-6 flex gap-3">
          <Link href="/in/lawyer" className="rounded-lg bg-gray-900 px-5 py-2.5 text-white text-sm font-medium hover:bg-gray-700">Open Lawyer Suite →</Link>
          <Link href="/guide#lawyer" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50">Read the guide</Link>
        </div>
      </section>

      {/* Security & Storage */}
      <section className="bg-gray-950 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 max-w-2xl">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Security & storage</span>
            <h2 className="text-3xl font-bold mt-3 mb-3">Built with enterprise security from day one</h2>
            <p className="text-gray-400">Legal and financial data is the most sensitive data there is. Klaro treats it that way.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🔒", title: "SHA-256 hashing", desc: "Every evidence file is cryptographically hashed. Tamper-proof audit trail for court." },
              { icon: "🛡", title: "Cloudflare WAF", desc: "Web application firewall protects every request. DDoS protection included on all plans." },
              { icon: "🏢", title: "Row-level security", desc: "Firm isolation enforced at database level. No firm can ever see another firm's data." },
              { icon: "📜", title: "DPDP compliant", desc: "India's Data Protection and Privacy Act compliant. Consent management and data processing agreements." },
              { icon: "💾", title: "Daily backups", desc: "Automatic daily backups with point-in-time recovery. Your data is never lost." },
              { icon: "🔑", title: "Supabase Auth", desc: "Industry-standard authentication. Passwords never stored in plain text." },
              { icon: "☁️", title: "Cloudflare R2 storage", desc: "Files stored on Cloudflare R2 — fast, redundant, globally distributed." },
              { icon: "🔍", title: "SOC2 roadmap", desc: "SOC2 Type I audit scheduled for Month 12. Enterprise-grade compliance coming." },
            ].map((s) => (
              <div key={s.title} className="border border-gray-800 rounded-xl p-4">
                <div className="text-2xl mb-2">{s.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-500">All prices include GST. Annual plan saves you 20% — that's 2 months free.</p>
          <p className="text-xs text-gray-400 mt-2">Prices shown as base + GST 18% = total payable per month</p>
        </div>

        <div className="mb-6">
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {CA_PLANS.map((plan) => <PlanCard key={plan.name} plan={plan} vertical="ca" />)}
        </div>
        <div className="border border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-between mb-16">
          <div>
            <p className="font-semibold text-gray-900">50+ users? Let's talk.</p>
            <p className="text-sm text-gray-500 mt-1">Custom pricing, dedicated support, SLA contract and SOC2 compliance for large CA firms.</p>
          </div>
          <Link href="/contact" className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 whitespace-nowrap">Contact us →</Link>
        </div>

        <div className="mb-6">
          <span className="text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {LAWYER_PLANS.map((plan) => <PlanCard key={plan.name} plan={plan} vertical="lawyer" />)}
        </div>
        <div className="border border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">50+ users? Let's talk.</p>
            <p className="text-sm text-gray-500 mt-1">Custom pricing, dedicated account manager, SLA contract and Section 65B audit trail for large law firms.</p>
          </div>
          <Link href="/contact" className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 whitespace-nowrap">Contact us →</Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">All prices in INR. GST 18% included in totals shown. Annual billing available at 20% discount.</p>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Start managing your practice better today</h2>
          <p className="text-gray-400 mb-8">Join CAs and lawyers already using Klaro. Free to start — no credit card required.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup?vertical=ca" className="rounded-lg bg-white text-gray-900 px-6 py-3 text-sm font-medium hover:bg-gray-100">Start free — CA Suite</Link>
            <Link href="/signup?vertical=lawyer" className="rounded-lg border border-gray-700 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800">Start free — Lawyer Suite</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-900">Klaro</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/guide" className="hover:text-gray-900">Guide</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
          <span>© 2026 Klaro. All rights reserved.</span>
        </div>
      </footer>

    </main>
  );
}
