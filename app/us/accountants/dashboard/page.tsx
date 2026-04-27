export default function USAccountantsDashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">US Accountant Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border p-5">Clients</div>
          <div className="rounded-2xl border p-5">Entities</div>
          <div className="rounded-2xl border p-5">Tax Forms</div>
          <div className="rounded-2xl border p-5">Document Vault</div>
        </div>
      </section>
    </main>
  );
}
