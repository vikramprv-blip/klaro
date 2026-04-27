export default function USLawyersDashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">US Lawyer Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border p-5">Matters</div>
          <div className="rounded-2xl border p-5">Clients</div>
          <div className="rounded-2xl border p-5">Evidence Vault</div>
          <div className="rounded-2xl border p-5">Billing</div>
        </div>
      </section>
    </main>
  );
}
