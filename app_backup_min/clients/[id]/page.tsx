export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="p-6 space-y-6">
      <header className="rounded-2xl border p-4">
        Client: {id} | PAN | GSTIN | Services | Manager | Outstanding dues
      </header>
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border p-4">Timeline</div>
        <div className="rounded-2xl border p-4">Summary cards</div>
      </section>
      <section className="rounded-2xl border p-4">
        Overview | Work | Documents | Agreements | Billing
      </section>
    </main>
  );
}
