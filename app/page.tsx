import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klaro — CA and Lawyer Practice Management Software India",
  description: "Klaro is India's #1 practice management platform for CAs and lawyers. GST filing, TDS, ITR, eCourts sync, evidence vault, Section 65B certificates, AI tools. Plans from ₹1,749/mo.",
  alternates: { canonical: "https://klaro.services" },
};

const CA_FEATURES = [
  { icon: "📋", title: "GST Filing Tracker", desc: "GSTR-1, 3B, 9 — track every client's status. Auto-reminders before due dates.", href: "/in/ca/gst" },
  { icon: "📊", title: "TDS Compliance", desc: "Form 24Q, 26Q, 27Q. Challan tracking, filed dates, never miss a quarter.", href: "/in/ca/tds" },
  { icon: "🗂", title: "ITR Management", desc: "Auto-select ITR form by entity type. 5-stage workflow from docs pending to filed.", href: "/in/ca/itr" },
  { icon: "💰", title: "Advance Tax", desc: "All 4 instalments auto-generated per client per AY. Mark paid with challan numbers.", href: "/in/ca/advance-tax" },
  { icon: "📅", title: "Compliance Calendar", desc: "FY 2026-27 pre-loaded. GST, TDS, ITR, ROC — colour-coded by urgency.", href: "/in/ca/deadlines" },
  { icon: "🤖", title: "8 AI Tools", desc: "Tax optimiser, GST health check, GSTR-2B reconciliation, notice reader, P&L parser.", href: "/in/ca/ai/tax-optimiser" },
  { icon: "📁", title: "Document Vault", desc: "Upload, index and AI-search all client documents. Semantic search by content.", href: "/in/ca/documents" },
  { icon: "🧾", title: "GST Invoicing", desc: "GST-compliant invoices with auto numbering, PDF and WhatsApp delivery.", href: "/in/ca/invoices" },
  { icon: "👥", title: "HR Module", desc: "Payroll with PF/ESIC/PT/TDS, attendance, leave management and payslips.", href: "/in/ca/hr" },
  { icon: "💬", title: "WhatsApp Reminders", desc: "AI-drafted document chase messages. Review, approve and send instantly.", href: "/in/ca/followups" },
];

const LAWYER_FEATURES = [
  { icon: "⚖️", title: "Matter Management", desc: "Full case lifecycle — client, CNR, court, opposing party, priority.", href: "/in/lawyer/matters" },
  { icon: "🏛️", title: "eCourts Hearing Sync", desc: "Auto-sync hearing dates from eCourts by CNR. Never miss a court date.", href: "/in/lawyer/hearings" },
  { icon: "🔐", title: "Evidence Vault + 65B", desc: "SHA-256 hashing on every file. Section 65B certificates in one click.", href: "/in/lawyer/evidence" },
  { icon: "⚡", title: "Action Engine", desc: "AI auto-creates prep reminders and invoice triggers from hearing changes.", href: "/in/lawyer" },
  { icon: "📨", title: "Legal Notice Generator", desc: "AI drafts notices under NI Act, IBC, Consumer Protection, RERA.", href: "/in/lawyer/notices" },
  { icon: "⏳", title: "Limitation Tracker", desc: "Track limitation periods. Alert 30 days before a matter goes time-barred.", href: "/in/lawyer/limitation" },
  { icon: "📝", title: "AI Drafting", desc: "Draft petitions, notices and agreements. AI completes, you review.", href: "/in/lawyer/drafts" },
  { icon: "⏱️", title: "Time Billing", desc: "ABA-style billable hours per matter. Generate invoices from time entries.", href: "/in/lawyer/time-billing" },
  { icon: "👥", title: "HR Module", desc: "Manage associates, clerks and staff. Payroll, attendance and timesheets.", href: "/in/lawyer/hr" },
  { icon: "🔍", title: "Legal Research", desc: "Quick links to LexisNexis India, CaseMine, Indian Kanoon, eCourts.", href: "/in/lawyer/research" },
];

const CA_PLANS = [
  {
    name: "Solo",
    base: "₹1,482", gst: "₹267", total: "₹1,749",
    annual: "₹16,790/yr",
    users: "1 user", clients: "50 clients", storage: "10 GB",
    highlight: false,
    features: [
      "10 GB document storage",
      "GST, TDS, ITR, advance tax",
      "All 8 AI tools included",
      "Compliance calendar",
      "GST-compliant invoicing",
      "WhatsApp reminders",
    ],
    addons: ["Extra storage from ₹299/10 GB"],
  },
  {
    name: "Partner",
    base: "₹3,601", gst: "₹648", total: "₹4,249",
    annual: "₹40,790/yr",
    users: "5 users", clients: "200 clients", storage: "50 GB",
    highlight: true,
    features: [
      "50 GB document storage",
      "Everything in Solo",
      "HR — payroll, PF, ESIC, TDS",
      "Attendance + leave management",
      "Team roles + permissions",
      "Bulk client import",
    ],
    addons: ["Extra storage from ₹299/10 GB"],
  },
  {
    name: "Firm",
    base: "₹21,186", gst: "₹3,813", total: "₹24,999",
    annual: "₹2,39,990/yr",
    users: "50 users", clients: "Unlimited", storage: "200 GB",
    highlight: false,
    features: [
      "200 GB document storage",
      "Everything in Partner",
      "ROC compliance tracker",
      "Audit trail (ICAI peer review)",
      "Multi-branch / offices",
      "Priority support + onboarding",
    ],
    addons: ["Extra storage from ₹1,199/50 GB"],
  },
];

const LAWYER_PLANS = [
  {
    name: "Solo",
    base: "₹2,000", gst: "₹360", total: "₹2,360",
    annual: "₹22,660/yr",
    users: "1 user", clients: "50 matters", storage: "25 GB",
    highlight: false,
    features: [
      "25 GB document + evidence storage",
      "eCourts hearing sync by CNR",
      "Evidence vault + SHA-256 hashing",
      "Section 65B certificate generation",
      "AI drafting + legal notices",
      "GST-compliant billing",
    ],
    addons: ["Extra storage from ₹399/10 GB"],
  },
  {
    name: "Partner",
    base: "₹6,000", gst: "₹1,080", total: "₹7,080",
    annual: "₹67,970/yr",
    users: "5 users", clients: "200 matters", storage: "100 GB",
    highlight: true,
    features: [
      "100 GB document + evidence storage",
      "Everything in Solo",
      "HR — payroll, attendance, leave",
      "Time billing + ABA hours",
      "Limitation period tracker",
      "Team roles + permissions",
    ],
    addons: ["Extra storage from ₹399/10 GB"],
  },
  {
    name: "Firm",
    base: "₹29,660", gst: "₹5,339", total: "₹34,999",
    annual: "₹3,35,990/yr",
    users: "50 users", clients: "Unlimited", storage: "500 GB",
    highlight: false,
    features: [
      "500 GB document + evidence storage",
      "Everything in Partner",
      "Full Section 65B audit trail",
      "Multi-branch / offices",
      "Priority support + onboarding",
      "ROC + compliance modules",
    ],
    addons: ["Extra storage from ₹1,599/50 GB"],
  },
];

function PlanCard({ plan, vertical }: { plan: typeof CA_PLANS[0]; vertical: string }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col border ${plan.highlight ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100"}`}>
      {plan.highlight && (
        <span className="text-xs font-medium bg-white/10 text-white px-3 py-1 rounded-full self-start mb-4">Most popular</span>
      )}
      <h3 className={`text-lg font-semibold mb-2 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>

      {/* Storage highlight */}
      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${plan.highlight ? "bg-white/10" : "bg-blue-50"}`}>
        <span className="text-base">💾</span>
        <span className={`text-sm font-semibold ${plan.highlight ? "text-white" : "text-blue-700"}`}>{plan.storage} storage included</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[plan.users, plan.clients].map(tag => (
          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${plan.highlight ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{tag}</span>
        ))}
      </div>

      <div className="mb-1">
        <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.total}</span>
        <span className={`text-sm ml-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>/mo</span>
      </div>
      <p className={`text-xs mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>{plan.base} + {plan.gst} GST (18%)</p>
      <p className={`text-xs mb-5 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>{plan.annual} — save 20% annually</p>

      <ul className="space-y-2 mb-4 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-green-400" : "text-green-600"}`}>✓</span>
            <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
          </li>
        ))}
      </ul>

      {/* Add-ons */}
      <div className={`text-xs mb-4 px-3 py-2 rounded-lg ${plan.highlight ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
        Add-on: {plan.addons[0]}
      </div>

      <Link href={`/signup?vertical=${vertical}&plan=${plan.name.toLowerCase()}`}
        className={`text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
          plan.highlight ? "bg-white text-gray-900 hover:bg-gray-100" : "border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}>
        Get started →
      </Link>
    </div>
  );
}

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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link href="/" className="text-xl font-bold tracking-tight">Klaro</Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <Link href="#ca" className="hover:text-gray-900">CA Suite</Link>
          <Link href="#lawyer" className="hover:text-gray-900">Lawyer Suite</Link>
          <Link href="#pricing" className="hover:text-gray-900">Pricing</Link>
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
            The practice OS for<br />CAs and Lawyers in India.
          </h1>
          <p className="text-lg text-gray-500 mb-3 leading-relaxed">
            Replace spreadsheets, WhatsApp chases and disconnected tools with one platform built for India — GST, TDS, ITR, eCourts, evidence vault, HR and AI in one dashboard.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Plans from <span className="font-semibold text-gray-600">₹1,749/mo</span> incl. GST · Storage included in every plan · No credit card required
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/signup?vertical=ca" className="rounded-lg bg-gray-900 px-6 py-3 text-white text-sm font-medium hover:bg-gray-700">Start free — CA Suite</Link>
            <Link href="/signup?vertical=lawyer" className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium hover:bg-gray-50">Start free — Lawyer Suite</Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-6 items-center justify-between text-xs text-gray-500">
          <span>💾 Storage included in every plan</span>
          <span>🔒 SHA-256 evidence hashing</span>
          <span>⚖️ Section 65B certified</span>
          <span>🏛️ eCourts live sync</span>
          <span>🤖 8 AI tools built-in</span>
          <span>📱 WhatsApp integrated</span>
          <span>🇮🇳 DPDP compliant</span>
          <span>🛡️ Cloudflare WAF</span>
        </div>
      </section>

      {/* CA Suite */}
      <section id="ca" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-10">
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
          <h2 className="text-3xl font-bold mt-4 mb-2">Complete GST, TDS and ITR management software for Indian CAs</h2>
          <p className="text-gray-500">From solo practitioners to 50-user firms. All compliance modules, AI tools, HR and invoicing included. Click any module to explore.</p>
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
          <h2 className="text-3xl font-bold mt-4 mb-2">Law firm management software with eCourts sync and Section 65B evidence vault</h2>
          <p className="text-gray-500">eCourts sync, evidence vault with Section 65B certification, AI legal notice drafting, time billing, HR and more — purpose-built for Indian advocates.</p>
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
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Security and storage</span>
            <h2 className="text-3xl font-bold mt-3 mb-3">Enterprise-grade security with storage included in every plan</h2>
            <p className="text-gray-400">Legal and financial data requires the highest protection. Every Klaro plan includes dedicated storage — no surprise charges.</p>
          </div>

          {/* Storage by plan */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {[
              { plan: "CA Solo", storage: "10 GB", color: "border-gray-700" },
              { plan: "CA Partner", storage: "50 GB", color: "border-blue-800" },
              { plan: "CA Firm", storage: "200 GB", color: "border-blue-600" },
              { plan: "Lawyer Solo", storage: "25 GB", color: "border-gray-700" },
              { plan: "Lawyer Partner", storage: "100 GB", color: "border-purple-800" },
              { plan: "Lawyer Firm", storage: "500 GB", color: "border-purple-600" },
            ].map(s => (
              <div key={s.plan} className={`border ${s.color} rounded-xl p-4 flex items-center gap-3`}>
                <span className="text-2xl">💾</span>
                <div>
                  <p className="text-xs text-gray-400">{s.plan}</p>
                  <p className="text-xl font-bold text-white">{s.storage}</p>
                  <p className="text-xs text-gray-500">included storage</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🔒", title: "SHA-256 hashing", desc: "Every evidence file cryptographically hashed. Tamper-proof court audit trail." },
              { icon: "🛡️", title: "Cloudflare WAF", desc: "Web application firewall on every request. DDoS protection included." },
              { icon: "🏢", title: "Row-level security", desc: "Firm isolation at database level. No firm can see another firm's data." },
              { icon: "📜", title: "DPDP compliant", desc: "India's Data Protection Act compliant. Consent management in place." },
              { icon: "💾", title: "Daily backups", desc: "Automatic daily backups with point-in-time recovery on AWS." },
              { icon: "☁️", title: "Cloudflare R2", desc: "Files stored on Cloudflare R2 — fast, redundant, globally distributed." },
              { icon: "🔑", title: "Secure auth", desc: "Industry-standard authentication. Passwords never stored in plain text." },
              { icon: "🔍", title: "SOC2 roadmap", desc: "SOC2 Type I audit in progress. Enterprise compliance coming Q4 2026." },
            ].map(s => (
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
          <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing — storage included</h2>
          <p className="text-gray-500 mb-2">All prices include GST 18%. Annual plan saves 20%. Storage included in every plan — no hidden charges.</p>
          <p className="text-xs text-gray-400">Shown as: base + GST 18% = total payable per month</p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
          <span className="text-xs text-gray-400">For chartered accountants and CA firms</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {CA_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} vertical="ca" />)}
        </div>
        <div className="border border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-between mb-16">
          <div>
            <p className="font-semibold text-gray-900">50+ users? Need more storage?</p>
            <p className="text-sm text-gray-500 mt-1">Custom pricing · Dedicated support · SLA contract · 1 TB+ storage</p>
          </div>
          <Link href="/contact" className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 whitespace-nowrap ml-4">Contact us →</Link>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
          <span className="text-xs text-gray-400">For advocates and law firms</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {LAWYER_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} vertical="lawyer" />)}
        </div>
        <div className="border border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">50+ users? Need more storage?</p>
            <p className="text-sm text-gray-500 mt-1">Custom pricing · Dedicated account manager · 1 TB+ storage · Section 65B audit trail</p>
          </div>
          <Link href="/contact" className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 whitespace-nowrap ml-4">Contact us →</Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">All prices in INR. GST 18% included. Annual billing available at 20% discount. Extra storage available on all plans.</p>
      </section>

      {/* FAQ for SEO */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
        <div className="space-y-5">
          {[
            { q: "How much storage do I get with each plan?", a: "CA Solo includes 10 GB, CA Partner 50 GB, CA Firm 200 GB. Lawyer Solo includes 25 GB, Lawyer Partner 100 GB, Lawyer Firm 500 GB. Extra storage is available from ₹299/10 GB for CA and ₹399/10 GB for Lawyer plans." },
            { q: "Is storage shared between users on a plan?", a: "Yes — storage is shared across all users on your plan. A CA Partner plan with 5 users shares the 50 GB pool. Your firm admin can monitor usage from the settings page." },
            { q: "What counts toward storage?", a: "All uploaded documents, evidence files, scanned receipts and generated certificates count toward your storage. Section 65B certificates are very small (under 100 KB each). Bulk evidence files like audio recordings or scanned documents are the main storage drivers." },
            { q: "Does Klaro work for both CAs and lawyers?", a: "Yes — Klaro has two separate suites. The CA Suite covers GST, TDS, ITR, advance tax, compliance calendar, AI tools and HR. The Lawyer Suite covers matter management, eCourts hearing sync, evidence vault, Section 65B certificates, AI drafting and time billing." },
            { q: "What is a Section 65B certificate?", a: "Section 65B of the Indian Evidence Act, 1872 requires a certificate to admit electronic records as evidence in court. Klaro auto-generates this certificate using the SHA-256 hash of any uploaded evidence file." },
            { q: "How does eCourts hearing sync work?", a: "Enter the CNR (Case Number Record) on any matter in Klaro. Click Sync — Klaro fetches the latest hearing dates directly from the eCourts system and updates your calendar. The Action Engine then automatically creates preparation reminders." },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 pb-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Start managing your practice better today</h2>
          <p className="text-gray-400 mb-2">Storage included. No credit card required. Set up in under 10 minutes.</p>
          <p className="text-xs text-gray-500 mb-8">CA Suite from ₹1,749/mo · Lawyer Suite from ₹2,360/mo · Annual plans save 20%</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup?vertical=ca" className="rounded-lg bg-white text-gray-900 px-6 py-3 text-sm font-medium hover:bg-gray-100">Start free — CA Suite</Link>
            <Link href="/signup?vertical=lawyer" className="rounded-lg border border-gray-700 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800">Start free — Lawyer Suite</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
          <div>
            <span className="font-semibold text-gray-900">Klaro</span>
            <p className="text-xs mt-1">CA and lawyer practice management software for India</p>
          </div>
          <div className="flex gap-6 text-xs">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/guide" className="hover:text-gray-900">Guide</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
          <span className="text-xs">© 2026 Klaro. All rights reserved.</span>
        </div>
      </footer>

    </main>
  );
}
