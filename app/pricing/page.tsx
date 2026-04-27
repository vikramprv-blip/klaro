export const dynamic = "force-dynamic";
import Link from "next/link";

const CA_PLANS = [
  {
    name: "Solo", users: "1 user", clients: "50 clients", storage: "10 GB",
    base: "₹1,482", gst: "₹267", total: "₹1,749", annual: "₹16,790",
    highlight: false,
    features: ["GST, TDS, ITR, advance tax tracking","All 8 AI tools","Compliance deadline calendar","Document vault with AI search","Invoicing + WhatsApp reminders","Email support"],
  },
  {
    name: "Partner", users: "5 users", clients: "200 clients", storage: "50 GB",
    base: "₹3,601", gst: "₹648", total: "₹4,249", annual: "₹40,790",
    highlight: true,
    features: ["Everything in Solo","HR — payroll with PF/ESIC/TDS","Attendance + leave management","Team roles + permissions","Bulk client import","Priority support"],
  },
  {
    name: "Firm", users: "50 users", clients: "Unlimited clients", storage: "200 GB",
    base: "₹21,186", gst: "₹3,813", total: "₹24,999", annual: "₹2,39,990",
    highlight: false,
    features: ["Everything in Partner","Multi-branch / offices","Workload dashboard","Partner sign-off chain","Custom onboarding","Dedicated support"],
  },
];

const LAWYER_PLANS = [
  {
    name: "Solo", users: "1 user", clients: "50 matters", storage: "25 GB",
    base: "₹2,000", gst: "₹360", total: "₹2,360", annual: "₹22,660",
    highlight: false,
    features: ["eCourts hearing sync by CNR","Evidence vault + SHA-256 hashing","Section 65B certificate generation","AI drafting — standard templates","Task management","Invoicing + billing"],
  },
  {
    name: "Partner", users: "5 users", clients: "200 matters", storage: "100 GB",
    base: "₹6,000", gst: "₹1,080", total: "₹7,080", annual: "₹67,970",
    highlight: true,
    features: ["Everything in Solo","HR — payroll, attendance, leave","Advanced AI drafting templates","Team roles + permissions","Action Engine — auto-alerts","Priority support"],
  },
  {
    name: "Firm", users: "50 users", clients: "Unlimited matters", storage: "500 GB",
    base: "₹29,660", gst: "₹5,339", total: "₹34,999", annual: "₹3,35,990",
    highlight: false,
    features: ["Everything in Partner","Full Section 65B audit trail","Multi-branch / offices","Timesheets + billable hours","Custom onboarding","Dedicated support"],
  },
];

const STORAGE_ADDONS = [
  { size: "10 GB", base: "₹253", gst: "₹46", total: "₹299" },
  { size: "50 GB", base: "₹1,017", gst: "₹183", total: "₹1,199" },
  { size: "100 GB", base: "₹1,694", gst: "₹305", total: "₹1,999" },
];

const LAWYER_STORAGE = [
  { size: "10 GB", base: "₹338", gst: "₹61", total: "₹399" },
  { size: "50 GB", base: "₹1,355", gst: "₹244", total: "₹1,599" },
  { size: "100 GB", base: "₹2,372", gst: "₹427", total: "₹2,799" },
];

function PlanCard({ plan, vertical }: { plan: typeof CA_PLANS[0]; vertical: string }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col border ${plan.highlight ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100"}`}>
      {plan.highlight && (
        <span className="text-xs font-medium bg-white/10 text-white px-3 py-1 rounded-full self-start mb-4">Most popular</span>
      )}
      <h3 className={`text-lg font-semibold mb-3 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {[plan.users, plan.clients, plan.storage].map(tag => (
          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${plan.highlight ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{tag}</span>
        ))}
      </div>
      <div className="mb-1">
        <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.total}</span>
        <span className={`text-sm ml-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>/mo</span>
      </div>
      <p className={`text-xs mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>{plan.base} + {plan.gst} GST (18%)</p>
      <p className={`text-xs mb-5 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>{plan.annual}/yr — save 20% annually</p>
      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.map(f => (
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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">Klaro</Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">Home</Link>
          <Link href="/guide" className="text-sm text-gray-500 hover:text-gray-900">Guide</Link>
          <Link href="/signin" className="text-sm text-gray-500 hover:text-gray-900">Sign in</Link>
          <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Get started free</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500 mb-2">All prices include GST 18%. Annual plan saves 20% — that's 2 months free.</p>
          <p className="text-xs text-gray-400">Prices shown as: base amount + GST (18%) = total payable per month</p>
        </div>

        {/* CA Suite */}
        <div className="mb-4">
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
          <p className="text-sm text-gray-500 mt-2">For chartered accountants, tax practitioners and CA firms</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {CA_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} vertical="ca" />)}
        </div>
        <div className="border border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-gray-900">50+ users? Let's talk.</p>
            <p className="text-sm text-gray-500 mt-1">Custom pricing · Dedicated support · SLA contract · SOC2 compliance</p>
          </div>
          <Link href="/contact" className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 whitespace-nowrap ml-4">Contact us →</Link>
        </div>

        {/* CA storage addons */}
        <div className="border border-gray-100 rounded-xl p-5 mb-16">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">CA Suite — additional storage</h3>
          <div className="grid grid-cols-3 gap-4">
            {STORAGE_ADDONS.map(s => (
              <div key={s.size} className="text-sm">
                <p className="font-medium text-gray-900">+{s.size}</p>
                <p className="text-gray-400 text-xs">{s.base} + {s.gst} GST = <span className="font-medium text-gray-700">{s.total}/mo</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Lawyer Suite */}
        <div className="mb-4">
          <span className="text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
          <p className="text-sm text-gray-500 mt-2">For advocates, solicitors and law firms</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {LAWYER_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} vertical="lawyer" />)}
        </div>
        <div className="border border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-gray-900">50+ users? Let's talk.</p>
            <p className="text-sm text-gray-500 mt-1">Custom pricing · Dedicated account manager · SLA contract · Section 65B audit trail</p>
          </div>
          <Link href="/contact" className="rounded-lg bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-700 whitespace-nowrap ml-4">Contact us →</Link>
        </div>

        {/* Lawyer storage addons */}
        <div className="border border-gray-100 rounded-xl p-5 mb-16">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Lawyer Suite — additional storage</h3>
          <div className="grid grid-cols-3 gap-4">
            {LAWYER_STORAGE.map(s => (
              <div key={s.size} className="text-sm">
                <p className="font-medium text-gray-900">+{s.size}</p>
                <p className="text-gray-400 text-xs">{s.base} + {s.gst} GST = <span className="font-medium text-gray-700">{s.total}/mo</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Common questions</h2>
          <div className="space-y-5">
            {[
              { q: "Can I change plans later?", a: "Yes — upgrade or downgrade anytime. Billing is prorated to the day." },
              { q: "What happens if I exceed my client or matter limit?", a: "We'll notify you and give you 7 days to upgrade before any restriction." },
              { q: "What is included in storage?", a: "All documents, evidence files, certificates and attachments count toward your storage. Certificates are tiny — only large evidence files (audio, video, scanned documents) consume significant storage." },
              { q: "Is there a free trial?", a: "Yes — start free and explore the full product. No credit card required to sign up." },
              { q: "What does 'Contact us' for 50+ users mean?", a: "We offer custom per-user pricing from ₹400/user (CA) and ₹500/user (Lawyer) for larger firms, with volume discounts, dedicated support and SLA contracts." },
              { q: "Are prices GST inclusive?", a: "All prices displayed on this page include GST at 18%. The breakdown (base + GST = total) is shown for each plan." },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-5">
                <p className="text-sm font-medium text-gray-900 mb-1">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
