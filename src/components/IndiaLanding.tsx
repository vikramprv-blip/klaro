import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-gray-900">Klaro</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</Link>
          <Link href="/guide" className="text-sm text-gray-500 hover:text-gray-900">Guide</Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Sign in</Link>
          <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-24 pb-20 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-green-100">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          Now in beta — free for early users
        </div>
        <h1 className="text-5xl font-semibold text-gray-900 leading-tight tracking-tight mb-6">
          The operating system<br />for Indian CA firms
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Klaro replaces the Excel files, WhatsApp chains, and missed deadlines. 
          Track every client's GST, TDS, ITR, and advance tax — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup?vertical=ca" className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
            Start free as a CA →
          </Link>
          <Link href="/signup?vertical=lawyer" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            I'm a Lawyer
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No credit card required · Free during beta</p>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center mb-12">The problem every CA firm has</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: "📊", title: "Compliance tracked in Excel", desc: "Multiple files, multiple versions, one mistake away from a missed deadline and a penalty." },
              { icon: "💬", title: "Client docs via WhatsApp", desc: "Documents buried in chats. No version control. Always asking the same client for the same file." },
              { icon: "⏰", title: "Deadline panic every quarter", desc: "March, June, September — the same scramble. Staff overloaded, partners firefighting." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution — CA Suite */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">CA Suite</span>
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Everything a CA practice needs</h2>
        <p className="text-gray-500 mb-12 max-w-2xl">One dashboard. Every client. Every compliance. Updated in real time by your team.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "GST Filing Manager", desc: "GSTR-1, 3B, 9, 9C tracked per client. Due date countdown. ITC reconciliation alerts.", color: "bg-blue-50 text-blue-800" },
            { title: "TDS Compliance", desc: "24Q, 26Q quarterly tracker. Challan records. Form 16/16A generation status.", color: "bg-purple-50 text-purple-800" },
            { title: "ITR Tracker", desc: "ITR-1 to ITR-7. Auto-selects form by entity type. 26AS mismatch detection.", color: "bg-teal-50 text-teal-800" },
            { title: "Advance Tax", desc: "All 4 instalments per client. Interest 234B/C calculator. Challan tracking.", color: "bg-amber-50 text-amber-800" },
            { title: "Compliance Calendar", desc: "200+ Indian deadlines pre-loaded. FY 2026-27. Penalty info per deadline.", color: "bg-rose-50 text-rose-800" },
            { title: "Document Vault", desc: "Client documents organised by PAN + FY. Upload, tag, share securely.", color: "bg-gray-50 text-gray-800" },
          ].map(({ title, desc, color }) => (
            <div key={title} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:bg-gray-50 transition-colors">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${color}`}>{title}</span>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lawyer Suite */}
      <section className="bg-gray-900 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-white/10 text-white px-3 py-1 rounded-full">Lawyer Suite</span>
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4 tracking-tight">Practice management for law firms</h2>
          <p className="text-gray-400 mb-12 max-w-2xl">From client intake to case closure. AI-powered drafting, deadline tracking, and client communication.</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { title: "Client intake", desc: "AI intake form, case classification, auto-assign" },
              { title: "Case timeline", desc: "Court dates, filing deadlines, limitation periods" },
              { title: "Draft generation", desc: "Legal notices, replies, vakalatnamas via AI" },
              { title: "Legal research", desc: "Case law summaries, judgment finder" },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/signup?vertical=lawyer" className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Join lawyer waitlist →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="px-8 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Simple, honest pricing</h2>
        <p className="text-gray-500 mb-8">Free during beta. Paid plans from ₹1,499/month after launch.</p>
        <Link href="/pricing" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          See full pricing →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Klaro</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-xs text-gray-400 hover:text-gray-600">Pricing</Link>
            <Link href="/guide" className="text-xs text-gray-400 hover:text-gray-600">User Guide</Link>
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600">Terms</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 Klaro. Made in India.</p>
        </div>
      </footer>
    </div>
  )
}
