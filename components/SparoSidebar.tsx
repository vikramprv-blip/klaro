"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

const NAV = [
  { section:"SPARO", items:[
    { href:"/sparo/app",              icon:"⚡", label:"Dashboard" },
    { href:"/sparo/app/links",          icon:"🔗", label:"Payment Links" },
    { href:"/sparo/app/links/new",      icon:"➕", label:"New Link" },
    { href:"/sparo/app/transactions",   icon:"💰", label:"Transactions" },
  ]},
  { section:"ACCOUNT", items:[
    { href:"/sparo/app/settings",     icon:"⚙️", label:"Settings" },
  ]},
]

interface Props { merchant: { email: string; plan: string; full_name: string } }

export default function SparoSidebar({ merchant }: Props) {
  const path   = usePathname()
  const router = useRouter()
  const isActive = (href: string) => href === "/sparo/app" ? path === href : path.startsWith(href)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("klaro_merchant")
    router.push("/auth")
  }

  return (
    <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:220, background:"#0D1117", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"16px 10px", display:"flex", flexDirection:"column", zIndex:40 }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingLeft:8, textDecoration:"none" }}>
        <div style={{ width:28, height:28, borderRadius:7, background:"#6366F1", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>⚡</div>
        <div>
          <span style={{ fontSize:14, fontWeight:800, color:"#F1F5F9" }}>Sparo</span>
          <span style={{ fontSize:10, color:"#6366F1", fontFamily:"monospace", marginLeft:6 }}>by klaro</span>
        </div>
      </Link>

      {NAV.map(section => (
        <div key={section.section} style={{ marginBottom:16 }}>
          <p style={{ fontSize:9, fontFamily:"monospace", letterSpacing:"0.12em", color:"#374151", paddingLeft:10, marginBottom:4 }}>{section.section}</p>
          {section.items.map(n => (
            <Link key={n.href} href={n.href} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:7, fontSize:13, color:isActive(n.href)?"#F1F5F9":"#6B7280", background:isActive(n.href)?"rgba(99,102,241,0.15)":"transparent", textDecoration:"none", fontWeight:isActive(n.href)?500:400, borderLeft:isActive(n.href)?"2px solid #6366F1":"2px solid transparent", marginBottom:1 }}>
              <span style={{ fontSize:13, width:16, textAlign:"center" }}>{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </div>
      ))}

      <div style={{ flex:1 }} />
      <div style={{ padding:"10px 8px", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:9, marginBottom:6 }}>
        <p style={{ fontSize:9, fontFamily:"monospace", color:"#6366F1", marginBottom:3 }}>{merchant.plan.toUpperCase()}</p>
        <p style={{ fontSize:11, color:"#6B7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{merchant.email}</p>
      </div>
      <button onClick={handleLogout} style={{ width:"100%", padding:"7px 10px", borderRadius:7, background:"transparent", border:"1px solid rgba(255,255,255,0.06)", color:"#6B7280", fontSize:12, cursor:"pointer", textAlign:"left" }}>
        ← Sign out
      </button>
    </aside>
  )
}
