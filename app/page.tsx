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
    </main>
  );
}
