export const dynamic = "force-dynamic";
import Link from "next/link"

const CA_PLANS = [
  {
    name: "Solo",
    price: "₹1,499",
    period: "/month",
    desc: "Single CA or freelance practitioner",
    highlight: false,
    features: ["25 clients", "1 user", "GST + TDS + ITR tracking", "Compliance calendar", "Document vault", "Email support"],
    cta: "Start free →",
  },
  {
    name: "Practice",
    price: "₹4,999",
    period: "/month",
    desc: "Small firm with 2–10 staff",
    highlight: true,
    features: ["150 clients", "10 users", "All Solo features", "Staff assignment", "Review workflow", "WhatsApp nudges", "Priority support"],
    cta: "Start free →",
  },
  {
    name: "Firm",
    price: "₹14,999",
    period: "/month",
    desc: "Mid-size firm, 10–50 staff",
    highlight: false,
    features: ["Unlimited clients", "50 users", "All Practice features", "Workload dashboard", "Partner sign-off chain", "Tally / Zoho push", "Dedicated support"],
    cta: "Contact us →",
  },
]

const LAWYER_PLANS = [
  {
    name: "Solo",
    price: "₹1,299",
    period: "/month",
    desc: "Individual advocate",
    highlight: false,
    features: ["30 active matters", "1 user", "Case timeline", "Deadline tracker", "AI draft generation", "Email support"],
    cta: "Join waitlist →",
  },
  {
    name: "Chamber",
    price: "₹4,499",
    period: "/month",
    desc: "Small chamber or firm",
    highlight: true,
    features: ["200 matters", "10 users", "All Solo features", "Client portal", "Legal research AI", "Document parser", "Priority support"],
    cta: "Join waitlist →",
  },
  {
    name: "Firm",
    price: "₹11,999",
    period: "/month",
    desc: "Full firm, up to 50 staff",
    highlight: false,
    features: ["Unlimited matters", "50 users", "All Chamber features", "Billing & time tracking", "Voice notes → tasks", "Custom workflows", "Dedicated support"],
    cta: "Contact us →",
  },
]

function PlanCard({ plan, vertical }: { plan: typeof CA_PLANS[0]; vertical: string }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col ${plan.highlight ? "bg-gray-900 text-white border-2 border-gray-900" : "bg-white border border-gray-100"}`}>
      {plan.highlight && (
        <span className="text-xs font-medium bg-white/10 text-white px-3 py-1 rounded-full self-start mb-4">Most popular</span>
      )}
      <h3 className={`text-lg font-semibold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
      <p className={`text-xs mb-4 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
      <div className="flex items-baseline gap-1 mb-6">
        <span className={`text-3xl font-semibold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
        <span className={`text-sm ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>{plan.period}</span>
      </div>
      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-center gap-2">
            <span className={`text-xs ${plan.highlight ? "text-green-400" : "text-green-600"}`}>✓</span>
            <span className={`text-sm ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/signup?vertical=${vertical}&plan=${plan.name.toLowerCase()}`}
        className={`text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
          plan.highlight
            ? "bg-white text-gray-900 hover:bg-gray-100"
            : "border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">Klaro</Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/in/ca" className="text-gray-500 hover:text-gray-900">CA Suite</Link>
          <Link href="#" className="text-gray-500 hover:text-gray-900">Lawyer Suite</Link>
          <Link href="/pricing" className="font-medium text-gray-900">Pricing</Link>
          <Link href="#" className="text-gray-500 hover:text-gray-900">Guide</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-green-100">
            Free during beta — all plans
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">Simple pricing</h1>
          <p className="text-gray-500 text-lg">Pay by team size, not by feature. All plans include the full module set.</p>
        </div>

        {/* Individual */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Individual</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">For self-filing professionals</h2>
          <p className="text-gray-500 text-sm mb-6">Track your own ITR, advance tax, and GST compliance. No firm needed.</p>
          <div className="max-w-sm border border-gray-100 rounded-2xl p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Personal</h3>
            <p className="text-xs text-gray-500 mb-4">Salaried, freelance, or business owner</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-semibold text-gray-900">₹299</span>
              <span className="text-sm text-gray-400">/month</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {["1 user (yourself)", "ITR tracking + AIS/26AS view", "Advance tax instalment reminders", "GST compliance (if applicable)", "Document vault"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-xs text-green-600">✓</span>
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup?vertical=individual" className="block text-center border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Start free →
            </Link>
          </div>
        </div>

        {/* CA Suite */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">For chartered accountants & firms</h2>
          <p className="text-gray-500 text-sm mb-6">Multi-client GST, TDS, ITR, advance tax, documents, deadlines — all modules included.</p>
          <div className="grid grid-cols-3 gap-6">
            {CA_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} vertical="ca" />)}
          </div>
        </div>

        {/* Lawyer Suite */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium bg-gray-900 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
            <span className="text-xs text-gray-400">Coming soon</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">For advocates & law firms</h2>
          <p className="text-gray-500 text-sm mb-6">Case management, AI drafting, deadline tracking, client communication. Join the waitlist.</p>
          <div className="grid grid-cols-3 gap-6">
            {LAWYER_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} vertical="lawyer" />)}
          </div>
        </div>

        {/* FAQ */}
        <div className="border-t border-gray-100 pt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">Common questions</h2>
          <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { q: "Is it really free during beta?", a: "Yes — all features, all modules, no credit card. We'll give 30 days notice before paid plans begin." },
              { q: "Can I add more users later?", a: "Yes. Upgrade or downgrade any time. New users get added immediately." },
              { q: "Does it connect to Tally?", a: "Tally push is available on Firm plan. Zoho and QuickBooks sync on Practice and above." },
              { q: "Is my client data safe?", a: "Yes. Hosted on Supabase (AWS), data encrypted at rest and in transit. Your data is never shared." },
              { q: "What happens if I exceed my client limit?", a: "We'll notify you before enforcing. Upgrading takes 30 seconds." },
              { q: "Do you support multiple GSTIN per client?", a: "Yes — each client can have multiple GSTINs, each tracked separately." },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
