"use client";

import { useEffect, useState } from "react";

export default function HearingsPage() {

  async function handleAction(id, status) {
    await fetch("/api/lawyer/actions/update", {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });
    location.reload();
  }

  const [hearings, setHearings] = useState([]);
  const [actions, setActions] = useState([]);
  const [syncing, setSyncing] = useState(false);

  async function loadHearings() {
    const res = await fetch("/api/lawyer/hearings");
    const data = await res.json();
    setHearings(data.hearings || []);
  }

  async function loadActions() {
    const res = await fetch("/api/lawyer/actions");
    const data = await res.json();
    setActions(data.actions || []);
  }

  async function refresh() {
    await Promise.all([loadHearings(), loadActions()]);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function syncCases() {
    setSyncing(true);
    const res = await fetch("/api/lawyer/case-sync", { method: "POST" });
    const data = await res.json();
    setSyncing(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    alert(`Case sync complete: ${data.synced} matters checked`);
    await refresh();
  }

  return (
    <main style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Lawyer Daily Desk</h1>
          <p>Today’s hearings, case sync, and action alerts.</p>
        </div>

        <button onClick={syncCases} disabled={syncing} style={{ padding: "10px 16px", borderRadius: 8 }}>
          {syncing ? "Syncing..." : "Sync Cases"}
        </button>
      </div>

      <section style={{ marginTop: 32 }}>
        <h2>Action Alerts</h2>

        {actions.length === 0 && <p>No pending alerts.</p>}

        <div style={{ display: "grid", gap: 12 }}>
          {actions.map((item) => (
            <div key={item.id} style={{ border: "1px solid #f0c36d", background: "#fff8e5", borderRadius: 12, padding: 16 }}>
              <b>{item.suggestion_type}</b>
              <p>{item.message}</p>
              <p><b>Matter:</b> {item.lawyer_matters?.title || "—"}</p>
              <p><b>Client:</b> {item.lawyer_matters?.client_name || "—"}</p>
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button onClick={() => handleAction(item.id, "done")}>
                  Mark Done
                </button>
                <button onClick={() => handleAction(item.id, "dismissed")}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Today's Hearings</h2>

        {hearings.length === 0 && <p>No hearings scheduled for today.</p>}

        <div style={{ display: "grid", gap: 12 }}>
          {hearings.map((item) => (
            <div key={item.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
              <h3>{item.title}</h3>
              <p><b>Client:</b> {item.client_name || "—"}</p>
              <p><b>Court:</b> {item.court_name || "—"}</p>
              <p><b>Date:</b> {item.next_hearing_date}</p>
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button onClick={() => handleAction(item.id, "done")}>
                  Mark Done
                </button>
                <button onClick={() => handleAction(item.id, "dismissed")}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
