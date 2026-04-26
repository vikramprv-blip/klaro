"use client";

import { useEffect, useState } from "react";

export default function HearingsPage() {
  const [hearings, setHearings] = useState([]);
  const [syncing, setSyncing] = useState(false);

  async function loadHearings() {
    const res = await fetch("/api/lawyer/hearings");
    const data = await res.json();
    setHearings(data.hearings || []);
  }

  useEffect(() => {
    loadHearings();
  }, []);

  async function syncCases() {
    setSyncing(true);

    const res = await fetch("/api/lawyer/case-sync", {
      method: "POST"
    });

    const data = await res.json();
    setSyncing(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    alert(`Case sync complete: ${data.synced} matters checked`);
    await loadHearings();
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Today's Hearings</h1>

      <button onClick={syncCases} disabled={syncing} style={{ marginTop: 16 }}>
        {syncing ? "Syncing..." : "Sync Cases"}
      </button>

      {hearings.length === 0 && (
        <p style={{ marginTop: 20 }}>No hearings scheduled for today</p>
      )}

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {hearings.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16
            }}
          >
            <h3>{item.title}</h3>
            <p><b>Client:</b> {item.client_name}</p>
            <p><b>Court:</b> {item.court_name}</p>
            <p><b>Date:</b> {item.next_hearing_date}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
