"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_SPARO = [
  { href:"/dashboard",              icon:"⚡", label:"Overview" },
  { href:"/dashboard/links",        icon:"🔗", label:"Payment Links" },
  { href:"/dashboard/transactions", icon:"💰", label:"Transactions" },
  { href:"/dashboard/settings",     icon:"⚙️", label:"Settings" },
]

const NAV_TOOLS = [
  { href:"/sparo",   icon:"⚡", label:"Sparo" },
  { href:"/varo",    icon:"🤖", label:"Varo" },
]

interface Props { merchant: { email: string; plan: string; full_name: string } }

export default function KlaroSidebar({ merchant }: Props) {
  const path = usePathname()
  const active = (href: string) => path === href || path.startsWith(href + "/")

  return (
    <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:220, background:"#111827", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"20px 12px", display:"flex", flexDirection:"column", gap:2, zIndex:40 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingLeft:8 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#fff" }}>K</div>
        <span style={{ fontSize:16, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.02em" }}>klaro</span>
      </div>

      <p style={{ fontSize:10, fontFamily:"monospace", letterSpacing:"0.1em", color:"#4B5563", paddingLeft:8, marginBottom:4 }}>SPARO</p>
      {NAV_SPARO.map(n => (
        <Link key={n.href} href={n.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, fontSize:13, color:active(n.href)?"#F1F5F9":"#6B7280", background:active(n.href)?"rgba(99,102,241,0.15)":"transparent", textDecoration:"none", fontWeight:active(n.href)?500:400 }}>
          <span style={{ fontSize:14 }}>{n.icon}</span><span>{n.label}</span>
        </Link>
      ))}

      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.06)", margin:"12px 0" }} />
      <p style={{ fontSize:10, fontFamily:"monospace", letterSpacing:"0.1em", color:"#4B5563", paddingLeft:8, marginBottom:4 }}>TOOLS</p>
      {NAV_TOOLS.map(n => (
        <Link key={n.href} href={n.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, fontSize:13, color:active(n.href)?"#F1F5F9":"#6B7280", background:active(n.href)?"rgba(99,102,241,0.15)":"transparent", textDecoration:"none" }}>
          <span style={{ fontSize:14 }}>{n.icon}</span><span>{n.label}</span>
        </Link>
      ))}

      <div style={{ flex:1 }} />
      <div style={{ padding:"12px", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10 }}>
        <p style={{ fontSize:10, fontFamily:"monospace", color:"#6366F1", marginBottom:3 }}>{merchant.plan.toUpperCase()}</p>
        <p style={{ fontSize:11, color:"#6B7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{merchant.email}</p>
        <Link href="/sparo" style={{ display:"block", marginTop:6, fontSize:11, color:"#6366F1", textDecoration:"none", fontWeight:600 }}>Upgrade plan →</Link>
      </div>
    </aside>
  )
}
