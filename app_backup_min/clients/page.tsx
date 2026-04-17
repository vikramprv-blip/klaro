export default function ClientsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <button className="rounded-xl border px-3 py-2">Add client</button>
      </div>
      <section className="rounded-2xl border p-4">
        Name | PAN | GSTIN | Services | Manager | Outstanding | Next deadline
      </section>
      <section className="rounded-2xl border p-4">
        <a className="underline" href="/clients/abc-pvt-ltd">Open sample client</a>
      </section>
    </main>
  );
}
