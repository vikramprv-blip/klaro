"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function PostLoginPage() {
  const [status, setStatus] = useState("Signing you in...")

  useEffect(() => {
    async function redirect() {
      const supabase = createClient()
      let session = null
      for (let i = 0; i < 6; i++) {
        const { data } = await supabase.auth.getSession()
        if (data.session) { session = data.session; break }
        await new Promise(r => setTimeout(r, 350))
      }
      if (!session) { window.location.href = "/signin"; return }

      setStatus("Loading your workspace...")

      const meta = session.user.user_metadata || {}
      const email = session.user.email

      // Master admin goes to admin panel
      if (email === "vikramprv@gmail.com" || meta.is_master_admin) {
        window.location.href = "/admin"
        return
      }

      // US users go to US app
      if (meta.vertical === "us" || meta.region === "us") {
        window.location.href = "/us/app"
        return
      }

      try {
        const res = await fetch("/api/onboarding/check", {
          headers: { "Authorization": `Bearer ${session.access_token}` },
          cache: "no-store",
        })
        const data = await res.json()
        if (!data.hasOrg) { window.location.href = "/onboarding"; return }
        if (data.vertical === "admin") { window.location.href = "/admin"; return }
        if (data.vertical === "us") { window.location.href = "/us/app"; return }
        if (data.vertical === "lawyer") { window.location.href = "/in/lawyer"; return }
        if (data.vertical === "both") { window.location.href = "/in/ca"; return }
        window.location.href = "/in/ca"
      } catch {
        window.location.href = "/in/ca"
      }
    }
    redirect()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">{status}</p>
      </div>
    </div>
  )
}
