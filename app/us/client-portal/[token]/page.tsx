"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function ClientPortalPage() {
  const params = useParams()
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/us/client-portal/access", {
        method: "POST",
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (data.url) setUrl(data.url)
      else setError(data.error)
    }

    if (token) load()
  }, [token])

  if (error) return <p>{error}</p>
  if (!url) return <p>Loading...</p>

  return (
    <div className="p-10">
      <iframe src={url} className="w-full h-screen" />
    </div>
  )
}
