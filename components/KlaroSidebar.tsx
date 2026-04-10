"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

interface NavItem { href: string; icon: string; label: string }
interface NavSection { section: string; color: string; items: NavItem[] }

const NAV: NavSection[] = [
  { section:"OVERVIEW", color:"#374151", items:[
    { href:"/dashboard", icon:"🏠", label:"Dashboard" },
  ]},
  { section:"SPARO · PAYMENT LINKS", color:"#6366F1", items:[
    { href:"/sparo/app",              icon:"⚡", label:"Sparo Home" },
    { href:"/dashboard/links",        icon:"🔗", label:"All Links" },
    { href:"/dashboard/links/new",    icon:"➕", label:"New Link" },
    { href:"/dashboard/transactions", icon:"💰", label:"Transactions" },
  ]},
  { section:"VARO · AI COLLECTIONS", color:"#8B5CF6", items:[
    { href:"/varo/app",                icon:"🤖", label:"Varo Home" },
    { href:"/varo/app/invoices/new",   icon:"📄", label:"New Invoice" },
    { href:"/varo/app/clients",        icon:"👥", label:"Clients" },
    { href:"/varo/app/collections",    icon:"📊", label:"Collections" },
    { href:"/varo/app/integrations",   icon:"🔌", label:"Integrations" },
  ]},
  { section:"ACCOUNT", color:"#374151", items:[
    { href:"/dashboard/settings", icon:"⚙️", label:"Settings" },
  ]},
]

interface Props { merchant: { email: string; plan: string; full_name: string } }

export default function KlaroSidebar({ merchant }: Props) {
  const path   = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === "/dashboard"
      ? path === "/dashboard"
      : path === href || path.startsWith(href + "/")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("klaro_merchant")
    router.push("/auth")
  }

  return (
    <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:224, background:"#0D1117", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"16px 10px", display:"flex", flexDirection:"column", overflowY:"auto", zIndex:40 }}>

      <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingLeft:8, textDecoration:"none" }}>
        <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#fff" }}>K</div>
        <span style={{ fontSize:15, fontWeight:800, color:"#F1F5F9", letterSpacing:"-0.02em" }}>klaro</span>
      </Link>

      {NAV.map(section => (
        <div key={section.section} style={{ marginBottom:16 }}>
          <p style={{ fontSize:9, fontFamily:"monospace", letterSpacing:"0.12em", color:section.color, paddingLeft:10, marginBottom:4, opacity:0.7 }}>
            {section.section}
          </p>
          {section.items.map(n => {
            const active = isActive(n.href)
            return (
              <Link key={n.href} href={n.href} style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"7px 10px", borderRadius:7, fontSize:13,
                color:active?"#F1F5F9":"#6B7280",
                background:active?"rgba(99,102,241,0.15)":"transparent",
                textDecoration:"none", fontWeight:active?500:400,
                borderLeft:active?"2px solid #6366F1":"2px solid transparent",
                marginBottom:1,
              }}>
                <span style={{ fontSize:13, width:16, textAlign:"center", flexShrink:0 }}>{n.icon}</span>
                <span style={{ fontSize:13 }}>{n.label}</span>
              </Link>
            )
          })}
        </div>
      ))}

      <div style={{ flex:1 }} />

      <div style={{ padding:"10px 8px", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:9, marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
          <span style={{ fontSize:9, fontFamily:"monospace", color:"#6366F1", letterSpacing:"0.08em" }}>{merchant.plan.toUpperCase()}</span>
          {merchant.plan === "free" && (
            <Link href="/#pricing" style={{ fontSize:9, color:"#6366F1", textDecoration:"none", fontWeight:700 }}>UPGRADE</Link>
          )}
        </div>
        <p style={{ fontSize:11, color:"#6B7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{merchant.email}</p>
      </div>

      <button onClick={handleLogout} style={{ width:"100%", padding:"7px 10px", borderRadius:7, background:"transparent", border:"1px solid rgba(255,255,255,0.06)", color:"#6B7280", fontSize:12, cursor:"pointer", textAlign:"left" }}>
        ← Sign out
      </button>
    </aside>
  )
}
