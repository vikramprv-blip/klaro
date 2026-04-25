import Link from "next/link";

const regions = [
  { name: "India", href: "/in/ca", label: "CA Suite" },
  { name: "United States", href: "/us", label: "Accountant Suite" },
  { name: "United Kingdom", href: "/uk", label: "Accountant Suite" },
  { name: "EU", href: "/eu", label: "Compliance Suite" },
  { name: "UAE", href: "/uae", label: "Business Suite" },
  { name: "Asia", href: "/asia", label: "Coming soon" },
];

const caPlans = [
  {
    name: "Solo",
    price: "₹1,499",
    desc: "Single CA or freelance practitioner",
    features: ["25 clients", "1 user", "GST + TDS + ITR tracking", "Compliance calendar", "Document vault", "Email support"],
  },
  {
    name: "Practice",
    price: "₹4,999",
    desc: "Small firm with 2–10 staff",
    popular: true,
    features: ["150 clients", "10 users", "All Solo features", "Staff assignment", "Review workflow", "WhatsApp nudges", "Priority support"],
  },
  {
    name: "Firm",
    price: "₹14,999",
    desc: "Mid-size firm, up to Up to 50 users",
    features: ["Unlimited clients", "Up to 50 users", "All Practice features", "Workload dashboard", "Partner sign-off chain", "Tally / Zoho push", "Dedicated support; 50+ users contact us"],
  },
];

const lawyerPlans = [
  {
    name: "Solo",
    price: "₹1,299",
    desc: "Individual advocate",
    features: ["30 active matters", "1 user", "Case timeline", "Deadline tracker", "AI draft generation", "Email support"],
  },
  {
    name: "Chamber",
    price: "₹4,499",
    desc: "Small chamber or firm",
    popular: true,
    features: ["200 matters", "10 users", "All Solo features", "Client portal", "Legal research AI", "Document parser", "Priority support"],
  },
  {
    name: "Firm",
    price: "₹11,999",
    desc: "Full firm, up to Up to 50 users",
    features: ["Unlimited matters", "Up to 50 users", "All Chamber features", "Billing & time tracking", "Voice notes → tasks", "Custom workflows", "Dedicated support; 50+ users contact us"],
  },
];

function PricingCards({ plans }: { plans: typeof caPlans }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-2xl border p-6 ${plan.popular ? "bg-slate-950 text-white" : "bg-white"}`}
        >
          {plan.popular && (
            <div className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              Most popular
            </div>
          )}
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className={`mt-1 text-sm ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>{plan.desc}</p>
          <p className="mt-6 text-3xl font-bold">
            {plan.price}<span className={`text-sm font-normal ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>/month</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {plan.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
          <Link
            href="/signup"
            className={`mt-8 block rounded-lg px-4 py-3 text-center text-sm font-medium ${
              plan.popular ? "bg-white text-slate-950" : "border"
            }`}
          >
            Start free →
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <nav className="mb-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">Klaro</Link>
          <div className="flex gap-3">
            <Link href="/pricing" className="rounded-lg border px-4 py-2 text-sm">Pricing</Link>
            <Link href="/signin" className="rounded-lg border px-4 py-2 text-sm">Sign in</Link>
            <Link href="/signup" className="rounded-lg bg-slate-950 px-4 py-2 text-sm text-white">Get started free</Link>
          </div>
        </nav>

        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            AI workspace for professional services
          </p>
          <h1 className="text-5xl font-bold tracking-tight">
            Run compliance, documents, tasks and client work from one AI-powered dashboard.
          </h1>
          <p className="text-lg text-slate-600">
            Klaro helps accountants, CAs, lawyers and service firms manage client work, deadlines, documents, follow-ups and AI assistance by region.
          </p>
          <div className="flex gap-3">
            <Link href="/signup" className="rounded-lg bg-slate-950 px-5 py-3 text-white">Start free</Link>
            <Link href="#regions" className="rounded-lg border px-5 py-3">Choose region</Link>
          </div>
        </div>

        <div id="regions" className="mt-16 grid gap-4 md:grid-cols-3">
          {regions.map((region) => (
            <Link key={region.name} href={region.href} className="rounded-2xl border p-6 hover:shadow-md">
              <h2 className="text-xl font-semibold">{region.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{region.label}</p>
            </Link>
          ))}
        </div>

        <section className="mt-24 space-y-6">
          <div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">CA Suite</span>
            <h2 className="mt-4 text-2xl font-bold">For chartered accountants & firms</h2>
            <p className="mt-2 text-slate-600">Multi-client GST, TDS, ITR, advance tax, documents, deadlines — all modules included.</p>
          </div>
          <PricingCards plans={caPlans} />
        </section>

        <section className="mt-24 space-y-6">
          <div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">Lawyer Suite</span>
            <span className="ml-3 text-sm text-slate-400">Coming soon</span>
            <h2 className="mt-4 text-2xl font-bold">For advocates & law firms</h2>
            <p className="mt-2 text-slate-600">Case management, AI drafting, deadline tracking, client communication. Join the waitlist.</p>
          </div>
          <PricingCards plans={lawyerPlans} />
        </section>
      </section>
    </main>
  );
}
