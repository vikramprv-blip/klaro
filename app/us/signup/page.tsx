export default function UsSignUpPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <a href="/us" className="text-sm text-slate-500 hover:text-slate-900">← Back to United States</a>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Create your Klaro United States account</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Continue into the US product instance.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="/us/app" className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-medium text-white">
            Enter US app
          </a>
          <a href="/us/signin" className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700">
            Already have an account? Sign in
          </a>
        </div>
      </section>
    </main>
  )
}
