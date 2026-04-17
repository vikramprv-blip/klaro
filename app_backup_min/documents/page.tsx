export default function DocumentsPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <section className="rounded-2xl border p-4">
        By client | By filing type | Missing docs | Recent uploads
      </section>
      <section className="rounded-2xl border p-4">
        Client | Filing type | Document type | Status | Requested | Uploaded | File count | Actions
      </section>
    </main>
  );
}
