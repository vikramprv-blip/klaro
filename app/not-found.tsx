export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you are looking for does not exist.</p>
        <div className="mt-8">
          <a href="/" className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-medium text-white">
            Go to home
          </a>
        </div>
      </section>
    </main>
  )
}
