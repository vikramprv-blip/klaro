export default function EuSignUpPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <a href="/eu" className="text-sm text-slate-500 hover:text-slate-900">← Back to European Union</a>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Create your Klaro European Union account</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Continue into the EU product instance.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="/eu/app" className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-medium text-white">
            Enter EU app
          </a>
          <a href="/eu/signin" className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700">
            Already have an account? Sign in
          </a>
        </div>
      </section>
    </main>
  )
}
