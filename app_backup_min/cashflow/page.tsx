export default function CashflowPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Cashflow</h1>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-4">Total receivables</div>
        <div className="rounded-2xl border p-4">Current month billed</div>
        <div className="rounded-2xl border p-4">Overdue &gt; 30 days</div>
        <div className="rounded-2xl border p-4">Collection rate</div>
      </section>
      <section className="rounded-2xl border p-4">
        Client | Invoice no | Amount | Issued | Due | Status | Reminder stage | Actions
      </section>
    </main>
  );
}
