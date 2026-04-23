import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Clients</h1>
        <Link href="/clients/new" style={{ border: "1px solid #d1d5db", padding: "8px 12px", borderRadius: 8, textDecoration: "none" }}>
          New client
        </Link>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            style={{ display: "block", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, textDecoration: "none" }}
          >
            <div style={{ fontWeight: 600 }}>{client.name}</div>
            <div style={{ opacity: 0.7, marginTop: 4 }}>{client.email || client.code || client.id}</div>
          </Link>
        ))}

        {clients.length === 0 ? <div>No clients found.</div> : null}
      </div>
    </main>
  );
}
