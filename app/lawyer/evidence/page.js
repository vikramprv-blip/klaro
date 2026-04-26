"use client";

import { useEffect, useState } from "react";

export default function EvidenceVaultPage() {
  const [evidence, setEvidence] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  async function loadEvidence() {
    const res = await fetch("/api/lawyer/evidence");
    const data = await res.json();
    setEvidence(data.evidence || []);
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  async function getLink(item) {
    if (!item.certificate_file_path) {
      alert("Certificate path missing. Re-upload evidence to generate a certificate path.");
      return;
    }

    const res = await fetch("/api/lawyer/evidence/link", {
      method: "POST",
      body: JSON.stringify({ path: item.certificate_file_path }),
    });

    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
    else alert(data.error || "Could not generate link");
  }

  async function verifyEvidence(item) {
    setLoadingId(item.id);

    const res = await fetch("/api/lawyer/evidence/verify", {
      method: "POST",
      body: JSON.stringify({ evidenceId: item.id }),
    });

    const data = await res.json();
    setLoadingId(null);

    if (data.error) {
      alert(data.error);
      return;
    }

    alert(data.verified ? "Evidence verified successfully" : "Tampering detected");
    await loadEvidence();
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Evidence Vault</h1>
      <p>Section 65B-ready evidence records with hash verification.</p>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {evidence.map((item) => (
          <div
            key={item.id}
            style={{
              border: item.integrity_status === "tampered" ? "2px solid red" : "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
              background: item.integrity_status === "tampered" ? "#fff5f5" : "white"
            }}
          >
            <h3>{item.original_filename || "Untitled Evidence"}</h3>
            <p><b>Status:</b> {item.integrity_status}</p>
            <p><b>SHA-256:</b> {item.file_hash}</p>
            <p><b>Uploaded:</b> {item.uploaded_at}</p>
            <p><b>Last Verified:</b> {item.last_verified_at || "Not verified yet"}</p>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button onClick={() => getLink(item)}>Download Certificate</button>
              <button onClick={() => verifyEvidence(item)} disabled={loadingId === item.id}>
                {loadingId === item.id ? "Verifying..." : "Re-Verify"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
