import UploadButton from "@/components/us/documents/upload-button";
"use client";

import { useEffect, useState } from "react";
import BlockerFilter from "@/components/us/blockers/blocker-filter";
import BlockerCount from "@/components/us/blockers/blocker-count";
import UpgradeModal from "@/components/us/billing/upgrade-modal";
import MarkBlockedButton from "@/components/us/blockers/mark-blocked-button";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/us/documents/filter?blockedOnly=${showBlockedOnly}`)
      .then(res => res.json())
      .then(data => setDocs(data.documents || []));
  }, [showBlockedOnly]);

  useEffect(() => {
    fetch("/api/us/usage")
      .then(res => res.json())
      .then(setUsage);
  }, []);

  const blockedCount = docs.filter(d => d.status === "blocked").length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>

      <BlockerCount count={blockedCount} />

      <BlockerFilter
        showBlockedOnly={showBlockedOnly}
        setShowBlockedOnly={setShowBlockedOnly}
      />

      <UpgradeModal locked={usage?.locked} />nn      <UploadButton locked={usage?.locked} />

      <div className="grid gap-4">
        {docs.map(doc => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{doc.title}</p>
              <p className="text-sm text-gray-500">{doc.file_name}</p>
            </div>

            <div className="flex items-center gap-2">
              {doc.status === "blocked" ? (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                  🚨 Blocked
                </span>
              ) : (
                <MarkBlockedButton docId={doc.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
