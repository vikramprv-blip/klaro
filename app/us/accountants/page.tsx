export default function USAccountantsPage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide">US Accountant Suite</p>
        <h1 className="text-4xl font-bold">Tax, document, billing, and client workflows for US accounting firms.</h1>
        <p className="text-lg text-muted-foreground">
          Starting with client records, entity profiles, tax year workflows, document vault, and Stripe billing.
        </p>
        <a className="inline-block rounded-xl border px-5 py-3 font-medium" href="/us/accountants/dashboard">
          Open dashboard
        </a>
      </section>
    </main>
  );
}
