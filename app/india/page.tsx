export default function IndiaPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Klaro India</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          India-specific compliance, CA and lawyer workflows.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="/india/signin" className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-medium text-white">
            Sign in
          </a>
          <a href="/india/signup" className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700">
            Sign up
          </a>
        </div>
      </section>
    </main>
  )
}
