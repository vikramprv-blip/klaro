export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.ca_invoices.findMany({
    include: {
      ca_clients: {
        select: {
          name: true,
          email: true,
          gstin: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const header = [
    "Invoice Number",
    "Client",
    "Email",
    "GSTIN",
    "Service",
    "Amount",
    "GST",
    "Total",
    "Status",
    "Due Date",
    "Paid Date",
  ];

  const rows = invoices.map((inv) => [
    inv.invoice_number,
    inv.ca_clients?.name || "",
    inv.ca_clients?.email || "",
    inv.ca_clients?.gstin || "",
    inv.service_type || "",
    Number(inv.amount || 0),
    Number(inv.gst_amount || 0),
    Number(inv.total_amount || 0),
    inv.status || "",
    inv.due_date ? new Date(inv.due_date).toISOString() : "",
    inv.paid_date ? new Date(inv.paid_date).toISOString() : "",
  ]);

  const csv =
    [header, ...rows]
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=invoices.csv",
    },
  });
}
