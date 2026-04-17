"use client";
export const dynamic = "force-dynamic";
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "../../../lib/supabase-browser"
import { Suspense } from "react"

function CallbackHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get("next") || "/dashboard"
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace(next)
      } else {
        window.location.replace("/auth")
      }
    })
  }, [searchParams])

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid #6366F1", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
        <p style={{ color:"#94A3B8", fontFamily:"monospace", fontSize:13 }}>Signing you in...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#0A0F1E" }} />}>
      <CallbackHandler />
    </Suspense>
  )
}
