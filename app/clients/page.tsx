"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  code: string | null;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/clients", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setClients(Array.isArray(data?.clients) ? data.clients : []);
      })
      .catch((error) => {
        console.error("Failed to load clients:", error);
        if (!active) return;
        setClients([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Clients</h1>
        <Link
          href="/clients/new"
          style={{
            border: "1px solid #d1d5db",
            padding: "8px 12px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          New client
        </Link>
      </div>

      {loading ? <div>Loading clients...</div> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            style={{
              display: "block",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              textDecoration: "none",
            }}
          >
            <div style={{ fontWeight: 600 }}>{client.name}</div>
            <div style={{ opacity: 0.7, marginTop: 4 }}>
              {client.email || client.code || client.id}
            </div>
          </Link>
        ))}

        {!loading && clients.length === 0 ? <div>No clients found.</div> : null}
      </div>
    </main>
  );
}
