"use client"
import Link from "next/link"

export default function CookiesPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", color:"#F1F5F9", fontFamily:"system-ui,sans-serif" }}>
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 48px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>K</div>
          <span style={{ fontSize:15, fontWeight:800, color:"#F1F5F9" }}>klaro</span>
        </Link>
        <Link href="/" style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}>← Back to Klaro</Link>
      </nav>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 48px" }}>
        <p style={{ fontFamily:"monospace", fontSize:11, color:"#6366F1", letterSpacing:"0.1em", marginBottom:8 }}>LEGAL</p>
        <h1 style={{ fontSize:36, fontWeight:900, letterSpacing:"-0.02em", marginBottom:8 }}>Cookie Policy</h1>
        <p style={{ fontSize:13, color:"#94A3B8", marginBottom:48 }}>Last updated: April 10, 2026 · Version 1.0</p>

        <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:14, padding:24, marginBottom:40 }}>
          <p style={{ fontSize:14, color:"#818CF8", lineHeight:1.7 }}>We use cookies and similar technologies to make Klaro work. This page explains what we use and why. You can manage your preferences at any time.</p>
        </div>

        {[
          {
            type:"Essential Cookies",
            required:true,
            color:"#10B981",
            desc:"These cookies are necessary for Klaro to function. They cannot be disabled.",
            cookies:[
              { name:"klaro_session", purpose:"Keeps you logged in during your session", duration:"Session" },
              { name:"klaro_auth",    purpose:"Stores your authentication token securely", duration:"7 days" },
              { name:"klaro_csrf",    purpose:"Prevents cross-site request forgery attacks", duration:"Session" },
            ]
          },
          {
            type:"Functional Cookies",
            required:false,
            color:"#6366F1",
            desc:"These cookies remember your preferences and settings.",
            cookies:[
              { name:"klaro_currency", purpose:"Remembers your preferred currency display", duration:"1 year" },
              { name:"klaro_sidebar",  purpose:"Remembers your sidebar state", duration:"1 year" },
            ]
          },
          {
            type:"Analytics Cookies",
            required:false,
            color:"#F59E0B",
            desc:"These help us understand how people use Klaro so we can improve it. All data is anonymised.",
            cookies:[
              { name:"_vercel_analytics", purpose:"Anonymous page view tracking via Vercel Analytics", duration:"1 year" },
            ]
          },
        ].map(section => (
          <div key={section.type} style={{ marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:"#F1F5F9" }}>{section.type}</h2>
              <span style={{ fontFamily:"monospace", fontSize:10, padding:"3px 8px", borderRadius:100, background:section.required?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)", color:section.required?"#10B981":"#F59E0B" }}>
                {section.required ? "REQUIRED" : "OPTIONAL"}
              </span>
            </div>
            <p style={{ fontSize:14, color:"#94A3B8", marginBottom:16, lineHeight:1.7 }}>{section.desc}</p>
            <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                    {["Cookie Name","Purpose","Duration"].map(h => (
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontFamily:"monospace", fontSize:10, color:"#6B7280", fontWeight:500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.cookies.map((c, i) => (
                    <tr key={c.name} style={{ borderTop:i===0?"none":"1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding:"10px 16px", fontFamily:"monospace", fontSize:12, color:"#6366F1" }}>{c.name}</td>
                      <td style={{ padding:"10px 16px", color:"#94A3B8" }}>{c.purpose}</td>
                      <td style={{ padding:"10px 16px", color:"#94A3B8" }}>{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div style={{ marginTop:40 }}>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>Managing Cookies</h2>
          <p style={{ fontSize:15, color:"#94A3B8", lineHeight:1.8, marginBottom:16 }}>You can control cookies through your browser settings. Note that disabling essential cookies will prevent Klaro from working. For other cookies, you can opt out without affecting core functionality.</p>
          <p style={{ fontSize:15, color:"#94A3B8", lineHeight:1.8 }}>For questions: <span style={{ color:"#6366F1" }}>privacy@klaro.services</span></p>
        </div>
      </div>
    </div>
  )
}
