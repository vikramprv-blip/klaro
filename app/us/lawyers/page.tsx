export default function USLawyersPage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide">US Lawyer Suite</p>
        <h1 className="text-4xl font-bold">Matter, evidence, document, retainer, and billing workflows for US law firms.</h1>
        <p className="text-lg text-muted-foreground">
          Starting with matter management, evidence vault, document vault, trust accounting, and ABA-style billing.
        </p>
        <a className="inline-block rounded-xl border px-5 py-3 font-medium" href="/us/lawyers/dashboard">
          Open dashboard
        </a>
      </section>
    </main>
  );
}
