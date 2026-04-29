export const dynamic = "force-dynamic";
import Link from "next/link";
import { headers } from "next/headers";

const CA_GUIDE = [
  { step: "1", title: "Add your clients", desc: "Go to CA Suite → Clients → Add client. Enter name, entity type (Individual, Pvt Ltd, LLP), PAN and GSTIN. Assign a tier (A/B/C) and staff member.", path: "/in/ca/clients" },
  { step: "2", title: "Set up firm settings", desc: "Go to Settings → Firm profile. Enter your firm name, address, GST number, email and admin name. This appears on all invoices and certificates.", path: "/in/ca" },
  { step: "3", title: "Generate GST filings", desc: "Go to GST Filings → select clients → generate. Track GSTR-1, 3B, 9 status per client. Use the status dropdown: Pending → In Progress → Filed. Enter the filed date when done.", path: "/in/ca/gst" },
  { step: "4", title: "Track TDS compliance", desc: "Go to TDS → Generate filings → select form type (24Q/26Q/27Q), quarter and clients. Update challan numbers and filed dates as you complete each filing.", path: "/in/ca/tds" },
  { step: "5", title: "Manage ITR filings", desc: "Go to ITR Tracker → Generate. The ITR form auto-selects by entity type. 5-stage workflow: Pending → Docs Pending → In Progress → Review Pending → Filed.", path: "/in/ca/itr" },
  { step: "6", title: "Track advance tax", desc: "Go to Advance Tax → Generate instalments. All 4 instalments are created per client per AY. Mark each as Paid when the challan is deposited.", path: "/in/ca/advance-tax" },
  { step: "7", title: "Check compliance deadlines", desc: "Go to Deadlines to see all FY 2026-27 compliance dates for GST, TDS, ITR, advance tax and ROC. Switch between list and calendar view. Red = overdue, amber = due soon.", path: "/in/ca/deadlines" },
  { step: "8", title: "Use AI tools", desc: "Go to AI Tools to access Tax Optimiser, GST Health Check, GSTR-2B Reconciliation, Notice Reader, P&L Parser, Penalty Calculator, Form 26AS analyser and Doc Chaser.", path: "/in/ca/ai/tax-optimiser" },
  { step: "9", title: "Manage documents", desc: "Go to Documents → Upload. All documents are indexed for AI search. Use the search bar to find any document by content, not just filename.", path: "/in/ca/documents" },
  { step: "10", title: "Create invoices", desc: "Go to Invoices → New invoice. Select client, add line items with GST rates. Generate PDF, send via WhatsApp or email directly from the platform.", path: "/in/ca/invoices" },
  { step: "11", title: "Set up HR module", desc: "Go to HR → Employees → Add employee. Enter name, role, department and salary. Then manage attendance, leave requests and generate payslips with PF/ESIC/TDS calculations.", path: "/in/ca/hr" },
  { step: "12", title: "Send follow-up reminders", desc: "Go to Follow-ups. The AI drafts a WhatsApp or email message to chase clients for documents. Review, edit and send. Track delivery and response status.", path: "/in/ca/followups" },
];

const LAWYER_GUIDE = [
  { step: "1", title: "Set up firm profile", desc: "Go to Lawyer Suite → Settings. Enter firm name, Bar Council registration number, GST, address and admin name. This appears on all certificates and invoices.", path: "/in/lawyer/settings" },
  { step: "2", title: "Add a matter", desc: "Go to Matters → New matter. Enter client name, matter title, type (civil/criminal/family/corporate), court name, CNR number and opposing party. Set priority.", path: "/in/lawyer/matters" },
  { step: "3", title: "Sync hearings via eCourts", desc: "On any matter with a CNR number, click Sync. Klaro fetches the latest hearing dates from eCourts automatically. The Action Engine then auto-creates prep reminders.", path: "/in/lawyer/hearings" },
  { step: "4", title: "Upload evidence to the vault", desc: "Go to Evidence → select matter → upload file. Every file is SHA-256 hashed automatically. A cryptographic fingerprint is stored — no one can alter the file without detection.", path: "/in/lawyer/evidence" },
  { step: "5", title: "Generate a Section 65B certificate", desc: "In the Evidence Vault, click '65B Cert' on any file. Klaro generates a court-ready PDF certificate with the SHA-256 hash, firm details and certification statement.", path: "/in/lawyer/evidence" },
  { step: "6", title: "Manage tasks", desc: "Go to Tasks → Add task. Assign to a matter with a due date. Status flow: Pending → In Progress → Done. Overdue tasks are highlighted in red across the dashboard.", path: "/in/lawyer/tasks" },
  { step: "7", title: "Use AI drafting", desc: "Go to Drafts → New draft. Select document type (petition, notice, agreement, letter). Enter the key facts and let the AI generate a first draft. Review and edit before use.", path: "/in/lawyer/drafts" },
  { step: "8", title: "Manage documents", desc: "Go to Documents to store all matter-related files — pleadings, orders, agreements, correspondence. Files are linked to matters and accessible from the matter view.", path: "/in/lawyer/documents" },
  { step: "9", title: "Create invoices and billing", desc: "Go to Billing → New invoice. Select matter, add time entries or fixed fees, apply GST. Generate PDF and send to client. Track payment status.", path: "/in/lawyer/billing" },
  { step: "10", title: "Set up HR module", desc: "Go to HR → Employees. Add associates, clerks and support staff. Manage attendance, approve leave requests, run payroll and track billable hours via timesheets.", path: "/in/lawyer/hr" },
  { step: "11", title: "Review action alerts", desc: "The Action Engine auto-creates alerts when hearings change, when prep is due or when invoices should be sent. Go to the Overview dashboard to see and act on pending actions.", path: "/in/lawyer" },
];

const US_LAWYER_GUIDE = [
  { step: "1", title: "Set up your firm profile", desc: "Go to Settings after signing up. Enter your firm name, Bar number, state, address and billing preferences. This appears on all invoices and client communications.", path: "/us/app" },
  { step: "2", title: "Create your first matter", desc: "Go to Matters → New Matter. Enter client name, matter title, type (Litigation, Corporate, Estate Planning etc.), jurisdiction, opposing party and filing deadline.", path: "/us/matters" },
  { step: "3", title: "Log billable time", desc: "On any matter, click Log Time. Enter date, description, hours and hourly rate. Klaro calculates the billable amount automatically. Use the Time tab to review all entries per matter.", path: "/us/matters" },
  { step: "4", title: "Add tasks to matters", desc: "On any matter, go to the Tasks tab → Add Task. Assign to an attorney with a due date and priority. Overdue tasks appear in red on the dashboard.", path: "/us/matters" },
  { step: "5", title: "Track deadlines and statute of limitations", desc: "When creating a matter, enter the Filing Deadline and Statute of Limitations dates. The dashboard surfaces matters with deadlines in the next 7 days automatically.", path: "/us/matters" },
  { step: "6", title: "Monitor blockers", desc: "Go to Blockers → Add Blocker. A blocker is anything stopping a matter from progressing — missing documents, waiting on opposing counsel, pending court orders. Blockers escalate after 3 days.", path: "/us/blockers" },
  { step: "7", title: "Use Klaro Sentinel AI", desc: "Sentinel monitors all your matters in real time. It flags stalled matters, overdue tasks, statute of limitations risks and fee leakage. Go to Sentinel to see AI-generated firm health insights.", path: "/us/sentinel" },
  { step: "8", title: "Manage documents", desc: "Go to Documents → Upload. Files are linked to matters. Use the search to find documents by content. All uploads are stored on US-based infrastructure.", path: "/us/documents" },
  { step: "9", title: "Cross-firm collaboration", desc: "Klaro connects law firms and CPA firms working on the same client. Use the cross-firm feature to share matters, blockers and documents securely with partner firms.", path: "/us/app" },
  { step: "10", title: "View your dashboard", desc: "The Practice Dashboard shows active matters, revenue this month, upcoming deadlines and active blockers at a glance. Sentinel health score summarises your firm's overall status.", path: "/us/app" },
];

const US_CPA_GUIDE = [
  { step: "1", title: "Set up your firm profile", desc: "Go to Settings after signing up. Enter your firm name, CPA license number, state, address and billing preferences.", path: "/us/app" },
  { step: "2", title: "Create a client matter", desc: "Go to Matters → New Matter. Select matter type (Tax, Audit, Advisory etc.), enter client details, deadlines and assigned accountant.", path: "/us/matters" },
  { step: "3", title: "Log billable time", desc: "On any matter, click Log Time. Enter date, service description, hours and rate. Klaro calculates billable amounts and tracks totals per matter.", path: "/us/matters" },
  { step: "4", title: "Track filing deadlines", desc: "Enter filing deadlines when creating matters. The dashboard highlights deadlines in the next 7 days. Red = overdue, amber = due soon.", path: "/us/matters" },
  { step: "5", title: "Manage documents", desc: "Upload client documents to each matter. Files are stored on US-based infrastructure and searchable by content.", path: "/us/documents" },
  { step: "6", title: "Use Klaro Sentinel AI", desc: "Sentinel monitors all matters for stalled work, overdue deliverables and fee leakage. Check the Sentinel dashboard for AI insights on your firm's health.", path: "/us/sentinel" },
  { step: "7", title: "Cross-firm collaboration", desc: "Work with law firm partners on shared clients. Share matters, documents and blockers securely across firms without email.", path: "/us/app" },
];

const STATUS_GST = [
  { label: "Pending", color: "bg-amber-50 text-amber-700", desc: "Not yet started" },
  { label: "In progress", color: "bg-blue-50 text-blue-700", desc: "Work has begun" },
  { label: "Filed", color: "bg-green-50 text-green-700", desc: "Successfully filed on portal" },
  { label: "Late filed", color: "bg-red-50 text-red-600", desc: "Filed after due date — late fee may apply" },
  { label: "N/A", color: "bg-gray-50 text-gray-400", desc: "Not applicable for this client" },
];

const STATUS_ITR = [
  { label: "Pending", color: "bg-amber-50 text-amber-700", desc: "Not started" },
  { label: "Docs pending", color: "bg-orange-50 text-orange-700", desc: "Waiting for client documents" },
  { label: "In progress", color: "bg-blue-50 text-blue-700", desc: "Being prepared" },
  { label: "Review pending", color: "bg-purple-50 text-purple-700", desc: "Ready for partner review" },
  { label: "Filed", color: "bg-green-50 text-green-700", desc: "Filed and acknowledged" },
];

const FAQS_IN = [
  { q: "How do I add more users to my firm?", a: "Go to Settings → Team → Invite member. Enter their email and assign a role (admin, lawyer, associate, staff). They'll receive an invite email to join your firm workspace." },
  { q: "Can I import my existing client list?", a: "Yes — go to Clients → Bulk import → upload a CSV file. The template is available on the import page. Map your columns and import in one go." },
  { q: "How does the eCourts hearing sync work?", a: "Enter the CNR number on a matter. Click Sync — Klaro calls the eCourts API, fetches the latest hearing dates and updates your calendar automatically. The Action Engine then creates prep reminders." },
  { q: "What is a Section 65B certificate?", a: "Section 65B of the Indian Evidence Act requires a certificate to admit electronic records as evidence in court. Klaro generates this automatically using the SHA-256 hash of your uploaded file." },
  { q: "Is my data backed up?", a: "Yes. Data is stored on Supabase (AWS infrastructure) with automatic daily backups and point-in-time recovery. Files are stored on Cloudflare R2 with geo-redundancy." },
  { q: "How do I generate a payslip?", a: "Go to HR → Payroll → select employee and month → enter basic, allowances and deductions. Klaro auto-calculates PF (12%), ESIC (3.25% if applicable), PT and TDS. Click Generate to create the payslip." },
  { q: "How do I report a bug or request a feature?", a: "Use the feedback button in the app or email support@klaro.services. We review all feedback and typically respond within 24 hours." },
];

const FAQS_US = [
  { q: "How do I invite team members?", a: "Go to Settings → Team → Invite. Enter their email and assign a role. They receive an invite email to join your firm workspace on Klaro." },
  { q: "How does Klaro Sentinel work?", a: "Sentinel is an AI layer that monitors all your matters in real time. It surfaces stalled matters, overdue tasks, statute of limitations risks and billing gaps. The health score summarises your firm's overall status." },
  { q: "What is a blocker?", a: "A blocker is anything stopping a matter from progressing — missing documents, awaiting opposing counsel, pending court orders, or a dependent task at a partner firm. Blockers escalate automatically after 3 days of inactivity." },
  { q: "How does cross-firm collaboration work?", a: "Klaro connects law firms and CPA firms working on the same client. You can share specific matters, documents and blockers with a partner firm securely. Each firm sees only what you choose to share." },
  { q: "Where is my data stored?", a: "All US client data is stored on US-East infrastructure (AWS). Klaro is HIPAA-ready and SOC 2 in progress. No data leaves US jurisdiction." },
  { q: "Can I import from Clio or MyCase?", a: "Yes. Klaro includes white-glove migration from Clio, MyCase, QuickBooks, and most other platforms. Contact us at us@klaro.services and we will handle the migration for you." },
  { q: "How do I report a bug or request a feature?", a: "Use the feedback button in the app or email us@klaro.services. We respond within 24 hours." },
];

export default async function GuidePage() {
  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  const host = headersList.get("host") || "";
  const xUrl = headersList.get("x-url") || headersList.get("x-invoke-path") || "";
  const isUS = referer.includes("/us") || xUrl.includes("/us");

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link href={isUS ? "/us" : "/"} className="text-xl font-bold tracking-tight text-gray-900">
          Klaro{isUS ? <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium align-middle">US</span> : ""}
        </Link>
        <div className="flex items-center gap-4">
          <Link href={isUS ? "/us" : "/"} className="text-sm text-gray-500 hover:text-gray-900">Home</Link>
          <Link href={isUS ? "/us/signin" : "/signin"} className="text-sm text-gray-500 hover:text-gray-900">Sign in</Link>
          <Link href={isUS ? "/us/signup" : "/signup"} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Get started free</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">User Guide</h1>
          <p className="text-gray-500">Step-by-step instructions for every feature in Klaro. Use the section links to jump to your product.</p>

          {isUS ? (
            <div className="flex gap-3 mt-4">
              <a href="#lawyers" className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700">Jump to Law Firm Guide</a>
              <a href="#cpas" className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100">Jump to CPA Guide</a>
              <a href="#faqs" className="text-xs font-medium bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100">FAQs</a>
            </div>
          ) : (
            <div className="flex gap-3 mt-4">
              <a href="#ca" className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100">Jump to CA Suite</a>
              <a href="#lawyer" className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700">Jump to Lawyer Suite</a>
              <a href="#faqs" className="text-xs font-medium bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100">FAQs</a>
            </div>
          )}

          {/* Region switcher */}
          <div className="mt-4 flex gap-2 items-center">
            <span className="text-xs text-gray-400">Viewing guide for:</span>
            <Link href="/guide" className={`text-xs px-3 py-1 rounded-full border ${!isUS ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>India</Link>
            <Link href="/us/guide" className={`text-xs px-3 py-1 rounded-full border ${isUS ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>United States</Link>
          </div>
        </div>

        {isUS ? (
          <>
            {/* US Law Firm Guide */}
            <section id="lawyers" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full">Law Firms</span>
                <h2 className="text-xl font-bold text-gray-900">Getting started as a US Law Firm</h2>
              </div>
              <div className="space-y-3">
                {US_LAWYER_GUIDE.map(({ step, title, desc, path }) => (
                  <div key={step} className="border border-gray-100 rounded-xl p-5 flex gap-4 hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">{step}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                        <Link href={path} className="text-xs text-blue-500 hover:underline flex-shrink-0 ml-4">Open →</Link>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* US CPA Guide */}
            <section id="cpas" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full">CPA Firms</span>
                <h2 className="text-xl font-bold text-gray-900">Getting started as a US CPA Firm</h2>
              </div>
              <div className="space-y-3">
                {US_CPA_GUIDE.map(({ step, title, desc, path }) => (
                  <div key={step} className="border border-gray-100 rounded-xl p-5 flex gap-4 hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">{step}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                        <Link href={path} className="text-xs text-blue-500 hover:underline flex-shrink-0 ml-4">Open →</Link>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* US Sentinel reference */}
            <section className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Klaro Sentinel — Matter status colours</h2>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {[
                  { color: "bg-red-100", label: "Red", meaning: "Overdue or escalated — immediate action required" },
                  { color: "bg-amber-100", label: "Amber", meaning: "Due within 7 days or blocker active 3+ days" },
                  { color: "bg-yellow-100", label: "Yellow", meaning: "Attention needed — stalled or no recent activity" },
                  { color: "bg-gray-100", label: "Gray", meaning: "On track — no issues detected" },
                  { color: "bg-green-100", label: "Green", meaning: "Completed or resolved" },
                ].map(({ color, label, meaning }) => (
                  <div key={label} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
                    <div className={`w-4 h-4 rounded-full ${color} flex-shrink-0`} />
                    <span className="text-sm font-medium text-gray-700 w-16">{label}</span>
                    <span className="text-sm text-gray-500">{meaning}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* US FAQs */}
            <section id="faqs" className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
              <div className="space-y-5">
                {FAQS_US.map(({ q, a }) => (
                  <div key={q} className="border-b border-gray-100 pb-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{q}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Need more help?</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">Our US support team responds within 24 hours.</p>
              <div className="flex gap-4 flex-wrap text-sm">
                <span className="text-gray-700">Email: <span className="font-medium">us@klaro.services</span></span>
                <Link href="/contact" className="text-blue-600 hover:underline">Contact form →</Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* India CA Suite Guide */}
            <section id="ca" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
                <h2 className="text-xl font-bold text-gray-900">Getting started as a CA</h2>
              </div>
              <div className="space-y-3">
                {CA_GUIDE.map(({ step, title, desc, path }) => (
                  <div key={step} className="border border-gray-100 rounded-xl p-5 flex gap-4 hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">{step}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                        <Link href={path} className="text-xs text-blue-500 hover:underline flex-shrink-0 ml-4">Open →</Link>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* India Lawyer Suite Guide */}
            <section id="lawyer" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold bg-gray-900 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
                <h2 className="text-xl font-bold text-gray-900">Getting started as a Lawyer</h2>
              </div>
              <div className="space-y-3">
                {LAWYER_GUIDE.map(({ step, title, desc, path }) => (
                  <div key={step} className="border border-gray-100 rounded-xl p-5 flex gap-4 hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">{step}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                        <Link href={path} className="text-xs text-blue-500 hover:underline flex-shrink-0 ml-4">Open →</Link>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Status reference */}
            <section className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Status reference</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">GST / TDS filing statuses</h3>
                  <div className="space-y-2">
                    {STATUS_GST.map(({ label, color, desc }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color} w-24 text-center flex-shrink-0`}>{label}</span>
                        <span className="text-sm text-gray-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">ITR filing statuses</h3>
                  <div className="space-y-2">
                    {STATUS_ITR.map(({ label, color, desc }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color} w-28 text-center flex-shrink-0`}>{label}</span>
                        <span className="text-sm text-gray-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Deadline colour codes</h2>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {[
                  { color: "bg-red-100", label: "Red", meaning: "Overdue — penalty may already be accruing" },
                  { color: "bg-amber-100", label: "Amber", meaning: "Due within 7 days — take action today" },
                  { color: "bg-yellow-100", label: "Yellow", meaning: "Due within 30 days — plan ahead" },
                  { color: "bg-gray-100", label: "Gray", meaning: "More than 30 days away" },
                  { color: "bg-green-100", label: "Green", meaning: "Filed / completed" },
                ].map(({ color, label, meaning }) => (
                  <div key={label} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
                    <div className={`w-4 h-4 rounded-full ${color} flex-shrink-0`} />
                    <span className="text-sm font-medium text-gray-700 w-16">{label}</span>
                    <span className="text-sm text-gray-500">{meaning}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="faqs" className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
              <div className="space-y-5">
                {FAQS_IN.map(({ q, a }) => (
                  <div key={q} className="border-b border-gray-100 pb-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{q}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Need more help?</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">Our team responds within 24 hours. For urgent issues, use the in-app feedback button.</p>
              <div className="flex gap-4 flex-wrap text-sm">
                <span className="text-gray-700">Email: <span className="font-medium">support@klaro.services</span></span>
                <Link href="/contact" className="text-blue-600 hover:underline">Contact form →</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
