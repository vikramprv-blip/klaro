"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Client = {
  id: string;
  name: string;
  email: string | null;
  gstin: string | null;
};

export default function CAClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/ca/clients", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        setClients(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to load CA clients:", err);
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

  if (loading) {
    return <div className="p-8">Loading clients...</div>;
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium">Clients</h1>
      </div>

      <div className="grid gap-3">
        {clients.map(c => (
          <Link
            key={c.id}
            href={`/in/ca/clients/${c.id}`}
            className="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-gray-500">
              {c.email || c.gstin || "—"}
            </div>
          </Link>
        ))}

        {clients.length === 0 && (
          <div className="text-gray-400 text-sm">No clients found</div>
        )}
      </div>
    </div>
  );
}
