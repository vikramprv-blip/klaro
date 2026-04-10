"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("klaro_cookie_consent")
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem("klaro_cookie_consent", JSON.stringify({ essential:true, functional:true, analytics:true, at:new Date().toISOString() }))
    setShow(false)
  }

  const essentialOnly = () => {
    localStorage.setItem("klaro_cookie_consent", JSON.stringify({ essential:true, functional:false, analytics:false, at:new Date().toISOString() }))
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{ position:"fixed", bottom:24, left:24, right:24, zIndex:100, display:"flex", justifyContent:"center" }}>
      <div style={{ maxWidth:720, width:"100%", background:"#111827", border:"1px solid rgba(99,102,241,0.3)", borderRadius:16, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, flexWrap:"wrap", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ flex:1, minWidth:260 }}>
          <p style={{ fontSize:14, fontWeight:600, color:"#F1F5F9", marginBottom:4 }}>🍪 We use cookies</p>
          <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6 }}>
            Essential cookies keep Klaro working. Optional cookies help us improve.{" "}
            <Link href="/cookies" style={{ color:"#6366F1" }}>Learn more</Link>
          </p>
        </div>
        <div style={{ display:"flex", gap:10, flexShrink:0 }}>
          <button onClick={essentialOnly} style={{ padding:"9px 18px", borderRadius:9, fontSize:13, background:"transparent", border:"1px solid rgba(255,255,255,0.12)", color:"#94A3B8", cursor:"pointer", fontWeight:500 }}>
            Essential only
          </button>
          <button onClick={accept} style={{ padding:"9px 18px", borderRadius:9, fontSize:13, background:"#6366F1", border:"none", color:"#fff", cursor:"pointer", fontWeight:600 }}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
