export const dynamic = "force-dynamic";
import Link from "next/link"

const CA_GUIDE = [
  {
    step: "1",
    title: "Add your clients",
    desc: "Go to CA Suite → Clients → Add client. Enter client name, entity type (Individual, Pvt Ltd, LLP etc.), PAN, and GSTIN. Assign a tier (A/B/C) and staff member.",
    path: "/ca/clients",
  },
  {
    step: "2",
    title: "Generate GST filings",
    desc: "Go to GST Filings → click the client rows to update status as you file. Use the status dropdown: Pending → In Progress → Filed. Enter the filed date when done.",
    path: "/ca/gst",
  },
  {
    step: "3",
    title: "Track TDS compliance",
    desc: "Go to TDS Compliance → Generate filings → select form type (24Q/26Q), quarter, and clients. Update challan numbers and filed dates as you complete each filing.",
    path: "/ca/tds",
  },
  {
    step: "4",
    title: "Manage ITR filings",
    desc: "Go to ITR Tracker → Generate filings. The ITR form is auto-selected based on entity type. Update status from Pending → Docs Pending → In Progress → Review Pending → Filed.",
    path: "/ca/itr",
  },
  {
    step: "5",
    title: "Track advance tax",
    desc: "Go to Advance Tax → Generate instalments. All 4 instalments are created per client for the assessment year. Mark each as Paid when the challan is deposited.",
    path: "/ca/advance-tax",
  },
  {
    step: "6",
    title: "Check compliance deadlines",
    desc: "Go to Deadlines to see all FY 2026-27 compliance dates for GST, TDS, ITR, advance tax, and ROC. Switch between list and calendar view. Red = overdue, amber = due soon.",
    path: "/ca/deadlines",
  },
]

const LAWYER_GUIDE = [
  {
    step: "1",
    title: "Add a matter",
    desc: "Go to Lawyer Suite → Matters → New matter. Enter client name, matter title, type (civil/criminal/family etc.), court, and case number. Set priority and next hearing date.",
    path: "/lawyer/matters",
  },
  {
    step: "2",
    title: "Track hearings",
    desc: "Go to Hearings → Add hearing. Select the matter, enter the hearing date and court. The dashboard shows today's hearings and upcoming dates with countdown.",
    path: "/lawyer/hearings",
  },
  {
    step: "3",
    title: "Manage tasks",
    desc: "Go to Tasks → Add task. Assign tasks to matters with due dates. Click the checkbox to move: Pending → In Progress → Done. Overdue tasks are highlighted in red.",
    path: "/lawyer/tasks",
  },
]

const FAQS = [
  { q: "How do I add more users to my firm?", a: "Currently in beta — contact us and we'll add users manually. Multi-user self-serve is coming in the next release." },
  { q: "Can I import my existing client list?", a: "CSV import is coming soon. For now, add clients manually via the Clients page. It takes about 30 seconds per client." },
  { q: "How does the compliance calendar work?", a: "The calendar is pre-seeded with all FY 2026-27 deadlines — GST, TDS, ITR, advance tax, ROC. It's not client-specific; it shows all national compliance dates." },
  { q: "Can my clients see their filing status?", a: "Client portal is on the roadmap. Coming in the next major release — clients will get a shareable link to see their own status." },
  { q: "Is the data backed up?", a: "Yes. Data is stored on Supabase (AWS infrastructure) with automatic daily backups and point-in-time recovery." },
  { q: "How do I report a bug?", a: "Email vikramch@hotmail.com or use the feedback link in the app. We typically respond within 24 hours during beta." },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">Klaro</Link>
        <div className="flex items-center gap-4">
          <Link href="/ca" className="text-sm text-gray-500 hover:text-gray-900">CA Suite</Link>
          <Link href="/lawyer" className="text-sm text-gray-500 hover:text-gray-900">Lawyer Suite</Link>
          <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">Get started</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">User Guide</h1>
          <p className="text-gray-500">Everything you need to get started with Klaro. Beta version — more features are being added weekly.</p>
        </div>

        {/* CA Suite Guide */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
            <h2 className="text-xl font-semibold text-gray-900">Getting started as a CA</h2>
          </div>
          <div className="space-y-4">
            {CA_GUIDE.map(({ step, title, desc, path }) => (
              <div key={step} className="border border-gray-100 rounded-xl p-5 flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                    <Link href={path} className="text-xs text-blue-500 hover:underline">Open →</Link>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lawyer Suite Guide */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium bg-gray-900 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
            <h2 className="text-xl font-semibold text-gray-900">Getting started as a Lawyer</h2>
          </div>
          <div className="space-y-4">
            {LAWYER_GUIDE.map(({ step, title, desc, path }) => (
              <div key={step} className="border border-gray-100 rounded-xl p-5 flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                    <Link href={path} className="text-xs text-blue-500 hover:underline">Open →</Link>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Status meanings */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Status reference</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">GST / TDS filing statuses</h3>
              <div className="space-y-2">
                {[
                  { label: "Pending",     color: "bg-amber-50 text-amber-700",  desc: "Not yet started" },
                  { label: "In progress", color: "bg-blue-50 text-blue-700",    desc: "Work has begun" },
                  { label: "Filed",       color: "bg-green-50 text-green-700",  desc: "Successfully filed on portal" },
                  { label: "Late filed",  color: "bg-red-50 text-red-600",      desc: "Filed after due date — late fee may apply" },
                  { label: "N/A",         color: "bg-gray-50 text-gray-400",    desc: "Not applicable for this client" },
                ].map(({ label, color, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color} border-current/20 w-24 text-center`}>{label}</span>
                    <span className="text-sm text-gray-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">ITR filing statuses</h3>
              <div className="space-y-2">
                {[
                  { label: "Pending",         color: "bg-amber-50 text-amber-700",   desc: "Not started" },
                  { label: "Docs pending",    color: "bg-orange-50 text-orange-700", desc: "Waiting for client documents" },
                  { label: "In progress",     color: "bg-blue-50 text-blue-700",     desc: "Being prepared" },
                  { label: "Review pending",  color: "bg-purple-50 text-purple-700", desc: "Ready for partner review" },
                  { label: "Filed",           color: "bg-green-50 text-green-700",   desc: "Filed and acknowledged" },
                ].map(({ label, color, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color} w-28 text-center`}>{label}</span>
                    <span className="text-sm text-gray-500">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Deadline colours */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Deadline colours</h2>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            {[
              { color: "bg-red-100",    label: "Red",    meaning: "Overdue — penalty may already be accruing" },
              { color: "bg-amber-100",  label: "Amber",  meaning: "Due within 7 days — take action today" },
              { color: "bg-yellow-100", label: "Yellow", meaning: "Due within 30 days — plan ahead" },
              { color: "bg-gray-100",   label: "Gray",   meaning: "More than 30 days away" },
              { color: "bg-green-100",  label: "Green",  meaning: "Filed / completed" },
            ].map(({ color, label, meaning }) => (
              <div key={label} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
                <div className={`w-4 h-4 rounded-full ${color}`} />
                <span className="text-sm font-medium text-gray-700 w-16">{label}</span>
                <span className="text-sm text-gray-500">{meaning}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beta note */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Beta version — your feedback shapes the product</h3>
          <p className="text-sm text-blue-700 leading-relaxed mb-3">
            Klaro is in active development. Features may change, bugs may exist. Your feedback directly influences what gets built next.
          </p>
          <p className="text-sm text-blue-600">
            Report bugs or suggest features: <span className="font-medium">vikramch@hotmail.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}
