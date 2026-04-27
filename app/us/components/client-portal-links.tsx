"use client"

import { useEffect, useState } from "react"

type PortalLink = {
  token: string
  document_id: string
  expires_at: string
  revoked_at: string | null
  created_at: string
}

export default function ClientPortalLinks() {
  const [links, setLinks] = useState<PortalLink[]>([])

  const loadLinks = async () => {
    const res = await fetch("/api/us/client-portal/links")
    const data = await res.json()
    setLinks(data.links || [])
  }

  useEffect(() => {
    loadLinks()
  }, [])

  const revokeLink = async (token: string) => {
    await fetch("/api/us/client-portal/revoke", {
      method: "POST",
      body: JSON.stringify({ token }),
    })

    await loadLinks()
  }

  return (
    <div className="rounded-2xl border p-5">
      <h2 className="mb-4 text-xl font-semibold">Shared Client Links</h2>

      {links.length === 0 && (
        <p className="text-sm text-muted-foreground">No shared links yet.</p>
      )}

      {links.length > 0 && (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.token} className="rounded-xl border p-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{link.revoked_at ? "Revoked" : "Active"} link</p>
                <p className="text-sm text-muted-foreground">
                  Expires {new Date(link.expires_at).toLocaleString()}
                </p>
              </div>

              {!link.revoked_at && (
                <button onClick={() => revokeLink(link.token)} className="text-sm underline">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
