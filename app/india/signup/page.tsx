export default function IndiaSignUpPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <a href="/india" className="text-sm text-slate-500 hover:text-slate-900">← Back to India</a>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Create your Klaro India account</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Choose the India product you want to start with.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <a href="/lawyers/signup" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-2xl font-semibold">Lawyer Suite</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Create a lawyer workspace for matters, hearings, drafts and billing.</p>
            <div className="mt-6 text-sm font-medium text-slate-900">Continue →</div>
          </a>

          <a href="/ca/signup" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-2xl font-semibold">CA Suite</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Create a CA workspace for GST, TDS, ITR, clients and deadlines.</p>
            <div className="mt-6 text-sm font-medium text-slate-900">Continue →</div>
          </a>
        </div>
      </section>
    </main>
  )
}
