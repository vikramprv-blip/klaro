"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

const NAV = [
  { section:"OVERVIEW", items:[
    { href:"/dashboard",              icon:"🏠", label:"Dashboard" },
  ]},
  { section:"SPARO — PAYMENT LINKS", items:[
    { href:"/dashboard/links",        icon:"🔗", label:"Payment Links" },
    { href:"/dashboard/links/new",    icon:"➕", label:"New Link" },
    { href:"/dashboard/transactions", icon:"💰", label:"Transactions" },
  ]},
  { section:"VARO — COLLECTIONS", items:[
    { href:"/varo/app",               icon:"🤖", label:"Collections" },
    { href:"/varo/app/invoices/new",  icon:"📄", label:"New Invoice" },
    { href:"/varo/app/clients",       icon:"👥", label:"Clients" },
  ]},
  { section:"ACCOUNT", items:[
    { href:"/dashboard/settings",     icon:"⚙️", label:"Settings" },
  ]},
]

interface Props { merchant: { email: string; plan: string; full_name: string } }

export default function KlaroSidebar({ merchant }: Props) {
  const path   = usePathname()
  const router = useRouter()
  const active = (href: string) => path === href || (href !== "/dashboard" && path.startsWith(href))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("klaro_merchant")
    router.push("/auth")
  }

  return (
    <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:224, background:"#0D1117", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"20px 12px", display:"flex", flexDirection:"column", overflowY:"auto", zIndex:40 }}>

      {/* Logo */}
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24, paddingLeft:8, textDecoration:"none" }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#fff" }}>K</div>
        <span style={{ fontSize:16, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.02em" }}>klaro</span>
      </Link>

      {/* Nav sections */}
      {NAV.map(section => (
        <div key={section.section} style={{ marginBottom:20 }}>
          <p style={{ fontSize:9, fontFamily:"monospace", letterSpacing:"0.12em", color:"#374151", paddingLeft:8, marginBottom:6 }}>{section.section}</p>
          {section.items.map(n => (
            <Link key={n.href} href={n.href} style={{
              display:"flex", alignItems:"center", gap:9,
              padding:"8px 10px", borderRadius:8, fontSize:13,
              color:active(n.href)?"#F1F5F9":"#6B7280",
              background:active(n.href)?"rgba(99,102,241,0.15)":"transparent",
              textDecoration:"none", fontWeight:active(n.href)?500:400,
              borderLeft:active(n.href)?"2px solid #6366F1":"2px solid transparent",
              marginBottom:2,
            }}>
              <span style={{ fontSize:13, width:18, textAlign:"center" }}>{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </div>
      ))}

      <div style={{ flex:1 }} />

      {/* Plan badge */}
      <div style={{ padding:"12px", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10, marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:10, fontFamily:"monospace", color:"#6366F1", letterSpacing:"0.06em" }}>{merchant.plan.toUpperCase()}</span>
          {merchant.plan === "free" && (
            <Link href="/sparo#pricing" style={{ fontSize:10, color:"#6366F1", textDecoration:"none", fontWeight:600 }}>Upgrade</Link>
          )}
        </div>
        <p style={{ fontSize:11, color:"#6B7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{merchant.email}</p>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={{ width:"100%", padding:"8px 10px", borderRadius:8, background:"transparent", border:"1px solid rgba(255,255,255,0.06)", color:"#6B7280", fontSize:13, cursor:"pointer", textAlign:"left" }}>
        Sign out
      </button>
    </aside>
  )
}
