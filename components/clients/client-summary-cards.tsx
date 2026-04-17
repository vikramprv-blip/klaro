export default function ClientSummaryCards({
  summary,
}: {
  summary: {
    totalFilings: number;
    pending: number;
    inProgress: number;
    review: number;
    filed: number;
    missingDocs: number;
    uploadedDocs: number;
    invoicesDraft: number;
    invoicesSent: number;
    invoicesPaid: number;
  };
}) {
  const cards = [
    { label: "Total Filings", value: summary.totalFilings },
    { label: "Pending", value: summary.pending },
    { label: "In Progress", value: summary.inProgress },
    { label: "Review", value: summary.review },
    { label: "Filed", value: summary.filed },
    { label: "Missing Docs", value: summary.missingDocs },
    { label: "Uploaded Docs", value: summary.uploadedDocs },
    { label: "Draft Invoices", value: summary.invoicesDraft },
    { label: "Sent Invoices", value: summary.invoicesSent },
    { label: "Paid Invoices", value: summary.invoicesPaid },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-zinc-500">{card.label}</div>
          <div className="mt-2 text-2xl font-semibold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
