import Link from "next/link";

export default function RegionSelectorPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
            Klaro Global
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">
            Choose your region
          </h1>
          <p className="mt-5 text-lg text-slate-300 max-w-2xl">
            Klaro is localized by country so pricing, workflows, and compliance match your market.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* INDIA */}
          <Link href="/in">
            <div className="rounded-2xl border border-blue-400/40 bg-white text-slate-900 p-6 hover:-translate-y-1 hover:shadow-2xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">IN</p>
                  <h2 className="text-2xl font-semibold">India</h2>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Live
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Practice OS for CAs, lawyers, compliance teams, documents, billing, and workflows.
              </p>
              <div className="mt-6 text-sm font-semibold">
                Enter region →
              </div>
            </div>
          </Link>

          {/* US */}
          <Link href="/us">
            <div className="rounded-2xl border border-blue-400/40 bg-white text-slate-900 p-6 hover:-translate-y-1 hover:shadow-2xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">US</p>
                  <h2 className="text-2xl font-semibold">United States</h2>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Live
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Secure client document portal for tax, accounting, and advisory firms.
              </p>
              <div className="mt-6 text-sm font-semibold">
                Enter region →
              </div>
            </div>
          </Link>

        </div>

        {/* COMING SOON */}
        <div className="mt-16 text-center border-t border-white/10 pt-10">
          <h3 className="text-xl font-semibold">New countries coming soon</h3>
          <p className="mt-3 text-sm text-slate-400">
            We are localizing Klaro for multiple countries. Join the waitlist to get early access.
          </p>
        </div>

      </div>

      {/* KLARO PULSE */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
                New Product
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                KLARO <span className="text-indigo-500">PULSE</span>
              </h2>
              <p className="text-gray-300 text-lg mb-3 leading-relaxed">
                The world's first Large Action Model (LAM) built specifically to audit business logic and compliance for Law Firms and Travel Tech.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Agentic UI monitoring that catches broken flows, compliance gaps, and JavaScript errors before your clients do. Hourly Sentinel heartbeats. Full LAM interaction traces.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {["Daily Agentic Audit", "US Compliance Baseline", "404 & Broken Link Discovery", "JavaScript Error Tracking", "SOC2 / ISO Readiness Checks"].map(f => (
                  <span key={f} className="text-xs bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 px-3 py-1 rounded-full">✓ {f}</span>
                ))}
              </div>
              <div className="flex gap-3">
                <a href="/pulse" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors">
                  Explore Klaro Pulse →
                </a>
                <a href="/pulse#pricing" className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-xl text-sm transition-colors">
                  View pricing
                </a>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "Sentinel Core", price: "$499/mo", desc: "Essential LAM monitoring for boutique firms", color: "border-gray-700 bg-gray-900/40" },
                { name: "Omni-Audit Pro", price: "$1,499/mo", desc: "Continuous diagnostic oversight · Recommended", color: "border-indigo-500 bg-indigo-600/20", badge: true },
                { name: "Custom Guard", price: "Custom", desc: "High-volume Travel GDS & Enterprise Legal Tech", color: "border-gray-700 bg-gray-900/40" },
              ].map(p => (
                <div key={p.name} className={`border rounded-2xl px-5 py-4 flex items-center justify-between ${p.color}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      {p.badge && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">Recommended</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </div>
                  <p className="text-lg font-bold text-white ml-4">{p.price}</p>
                </div>
              ))}
              <p className="text-xs text-gray-500 text-center">14-day pilot available on Omni-Audit Pro</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
