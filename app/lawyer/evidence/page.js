"use client";

import { useEffect, useState } from "react";

const TEST_FIRM_ID = "c07446d6-da3a-438f-93ca-90eff2c7bb70";
const TEST_MATTER_ID = "06f1120c-aff3-46b5-931a-c8e98fbf30bd";

export default function EvidenceVaultPage() {
  const [evidence, setEvidence] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function loadEvidence() {
    const res = await fetch("/api/lawyer/evidence");
    const data = await res.json();
    setEvidence(data.evidence || []);
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  async function uploadEvidence(e) {
    e.preventDefault();

    const file = e.target.file.files[0];
    if (!file) {
      alert("Please choose a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("firmId", TEST_FIRM_ID);
    formData.append("matterId", TEST_MATTER_ID);

    setUploading(true);

    const res = await fetch("/api/lawyer/evidence/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setUploading(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    e.target.reset();
    await loadEvidence();
  }

  async function getLink(item) {
    if (!item.certificate_file_path) {
      alert("Certificate path missing. CLI-generated certificates only for now.");
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
      <p>Upload, hash, verify, and prepare Section 65B-ready evidence.</p>

      <form onSubmit={uploadEvidence} style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Upload Evidence</h2>
        <input name="file" type="file" />
        <button style={{ marginLeft: 12 }} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

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
