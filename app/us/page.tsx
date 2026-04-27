export default function USHomePage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide">Klaro US</p>
        <h1 className="text-4xl font-bold">Professional portals for US accountants and lawyers.</h1>
        <p className="text-lg text-muted-foreground">
          Built for document vaults, matter management, tax workflows, billing, and compliance.
        </p>
        <div className="flex gap-4">
          <a className="rounded-xl border px-5 py-3 font-medium" href="/us/accountants">Accountants</a>
          <a className="rounded-xl border px-5 py-3 font-medium" href="/us/lawyers">Lawyers</a>
        </div>
      </section>
    </main>
  );
}
