"use client";

import { useEffect, useState } from "react";

export default function EvidenceVaultPage() {
  const [evidence, setEvidence] = useState([]);

  async function loadEvidence() {
    const res = await fetch("/api/lawyer/evidence");
    const data = await res.json();
    setEvidence(data.evidence || []);
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <h1>Evidence Vault</h1>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {evidence.map((item) => (
          <div
            key={item.id}
            style={{
              border: item.integrity_status === "tampered" ? "2px solid red" : "1px solid #ddd",
              borderRadius: 12,
              padding: 16
            }}
          >
            <h3>{item.original_filename}</h3>

            <p><b>Client:</b> {item.client_name || "—"}</p>
            <p><b>Matter:</b> {item.matter_title || "—"}</p>
            <p><b>Court:</b> {item.court_name || "—"}</p>

            <hr style={{ margin: "12px 0" }} />

            <p><b>Status:</b> {item.integrity_status}</p>
            <p><b>SHA-256:</b> {item.file_hash}</p>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button onClick={() => alert("Generate already built")}>
                Generate Certificate
              </button>
              <button onClick={() => alert("Download already built")}>
                Download Certificate
              </button>
              <button onClick={() => alert("Verify already built")}>
                Re-Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
