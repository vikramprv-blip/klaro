"use client";

import { useEffect, useState } from "react";

export default function EvidenceVaultPage() {
  const [evidence, setEvidence] = useState([]);

  useEffect(() => {
    fetch("/api/lawyer/evidence")
      .then(res => res.json())
      .then(data => setEvidence(data.evidence || []));
  }, []);

  async function getLink(item) {
    const path = `certificates/${item.firm_id}/${item.matter_id}`;
    const res = await fetch("/api/lawyer/evidence/link", {
      method: "POST",
      body: JSON.stringify({ path }),
    });
    const data = await res.json();
    window.open(data.url, "_blank");
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Evidence Vault</h1>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {evidence.map((item) => (
          <div key={item.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
            <h3>{item.original_filename}</h3>

            <p><b>Status:</b> {item.integrity_status}</p>
            <p><b>SHA-256:</b> {item.file_hash}</p>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button onClick={() => getLink(item)}>Download Certificate</button>
              <button onClick={() => alert("Re-verify coming next")}>Re-Verify</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
