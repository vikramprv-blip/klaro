"use client"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

type KlaroItem = {
  id: string; week: string; area: string; task: string
  description: string; priority: string; status: string
}
type LawyerItem = {
  id: string; phase: string; service: string; task: string
  description: string; impact: string; status: string
}

const STATUS_COLORS: Record<string, string> = {
  "Done": "#10B981", "In Progress": "#F59E0B", "Pending": "#6B7280",
}
const PRIORITY_COLORS: Record<string, string> = {
  "High": "#EF4444", "Medium": "#F59E0B", "Low": "#6366F1",
}

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11,
    fontWeight:700, fontFamily:"monospace", background:color+"20", color,
    border:`1px solid ${color}40`, letterSpacing:"0.04em" }}>{label}</span>
)

const StatusBtn = ({ current, value, onChange }: { current:string; value:string; onChange:()=>void }) => (
  <button onClick={onChange} style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600,
    border:`1px solid ${current===value ? STATUS_COLORS[value] : "rgba(255,255,255,0.1)"}`,
    background:current===value ? STATUS_COLORS[value]+"25" : "transparent",
    color:current===value ? STATUS_COLORS[value] : "#6B7280", cursor:"pointer", transition:"all 0.15s" }}>
    {value}
  </button>
)

export default function RoadmapPage() {
  const [tab, setTab]         = useState<"klaro"|"lawyer">("klaro")
  const [klaro, setKlaro]     = useState<KlaroItem[]>([])
  const [lawyer, setLawyer]   = useState<LawyerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string|null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from("klaro_roadmap").select("*").order("week").order("priority"),
      supabase.from("lawyer_roadmap").select("*").order("phase").order("impact"),
    ]).then(([k, l]) => {
      if (k.data) setKlaro(k.data)
      if (l.data) setLawyer(l.data)
      setLoading(false)
    })
  }, [])

  const updateKlaro = async (id: string, status: string) => {
    setSaving(id)
    setKlaro(prev => prev.map(r => r.id===id ? {...r,status} : r))
    await supabase.from("klaro_roadmap").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    setSaving(null)
  }
  const updateLawyer = async (id: string, status: string) => {
    setSaving(id)
    setLawyer(prev => prev.map(r => r.id===id ? {...r,status} : r))
    await supabase.from("lawyer_roadmap").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    setSaving(null)
  }

  const kStats = { total:klaro.length, done:klaro.filter(r=>r.status==="Done").length,
    inprog:klaro.filter(r=>r.status==="In Progress").length, pending:klaro.filter(r=>r.status==="Pending").length }
  const lStats = { total:lawyer.length, done:lawyer.filter(r=>r.status==="Done").length,
    inprog:lawyer.filter(r=>r.status==="In Progress").length, pending:lawyer.filter(r=>r.status==="Pending").length }

  const kGroups = klaro.reduce<Record<string,KlaroItem[]>>((a,r)=>{ (a[r.week]=a[r.week]||[]).push(r); return a },{})
  const lGroups = lawyer.reduce<Record<string,LawyerItem[]>>((a,r)=>{ (a[r.phase]=a[r.phase]||[]).push(r); return a },{})
  const pct = (d:number,t:number) => t ? Math.round((d/t)*100) : 0
  const stats = tab==="klaro" ? kStats : lStats

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#080C14", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#94A3B8", fontFamily:"monospace" }}>Loading roadmap...</p>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"#080C14", color:"#F1F5F9", fontFamily:"system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#0D1117", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"20px 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:11, fontFamily:"monospace", color:"#6366F1", letterSpacing:"0.1em", marginBottom:4 }}>KLARO.SERVICES</p>
              <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em" }}>Product Roadmap</h1>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {(["klaro","lawyer"] as const).map(t => (
                <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 20px", borderRadius:8, fontSize:13,
                  fontWeight:600, border:`1px solid ${tab===t?"#6366F1":"rgba(255,255,255,0.08)"}`,
                  background:tab===t?"rgba(99,102,241,0.15)":"transparent",
                  color:tab===t?"#818CF8":"#6B7280", cursor:"pointer" }}>
                  {t==="klaro" ? "⚡ Klaro" : "⚖️ Lawyer LAM"}
                </button>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[{label:"Total",value:stats.total,color:"#94A3B8"},{label:"Done",value:stats.done,color:"#10B981"},
              {label:"In Progress",value:stats.inprog,color:"#F59E0B"},{label:"Pending",value:stats.pending,color:"#6B7280"}
            ].map(s => (
              <div key={s.label} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"12px 16px" }}>
                <p style={{ fontSize:11, color:"#4B5563", marginBottom:4, fontFamily:"monospace" }}>{s.label}</p>
                <p style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop:12, background:"rgba(255,255,255,0.05)", borderRadius:4, height:6, overflow:"hidden" }}>
            <div style={{ display:"flex", height:"100%" }}>
              <div style={{ width:`${pct(stats.done,stats.total)}%`, background:"#10B981", transition:"width 0.5s" }} />
              <div style={{ width:`${pct(stats.inprog,stats.total)}%`, background:"#F59E0B", transition:"width 0.5s" }} />
            </div>
          </div>
          <p style={{ fontSize:11, color:"#4B5563", marginTop:4, fontFamily:"monospace" }}>
            {pct(stats.done,stats.total)}% complete · {pct(stats.inprog,stats.total)}% in progress
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 32px" }}>
        {tab==="klaro" && Object.entries(kGroups).map(([week,items]) => (
          <div key={week} style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:6, padding:"3px 12px" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#818CF8", fontFamily:"monospace" }}>{week}</span>
              </div>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.05)" }} />
              <span style={{ fontSize:11, color:"#4B5563" }}>{items.filter(i=>i.status==="Done").length}/{items.length} done</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {items.map(item => (
                <div key={item.id} style={{ background:item.status==="Done"?"rgba(16,185,129,0.04)":"#0F1520",
                  border:`1px solid ${item.status==="Done"?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.06)"}`,
                  borderRadius:10, padding:"14px 18px", opacity:item.status==="Done"?0.7:1, transition:"all 0.2s" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:14, fontWeight:600, color:item.status==="Done"?"#4B5563":"#F1F5F9",
                          textDecoration:item.status==="Done"?"line-through":"none" }}>{item.task}</span>
                        <Badge label={item.area} color="#6366F1" />
                        <Badge label={item.priority} color={PRIORITY_COLORS[item.priority]} />
                      </div>
                      <p style={{ fontSize:13, color:"#6B7280", margin:0 }}>{item.description}</p>
                    </div>
                    <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center" }}>
                      {["Done","In Progress","Pending"].map(s => (
                        <StatusBtn key={s} current={item.status} value={s} onChange={()=>updateKlaro(item.id,s)} />
                      ))}
                      {saving===item.id && <span style={{ fontSize:11, color:"#F59E0B" }}>saving...</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {tab==="lawyer" && Object.entries(lGroups).map(([phase,items]) => (
          <div key={phase} style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:6, padding:"3px 12px" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#A78BFA", fontFamily:"monospace" }}>{phase}</span>
              </div>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.05)" }} />
              <span style={{ fontSize:11, color:"#4B5563" }}>{items.filter(i=>i.status==="Done").length}/{items.length} done</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {items.map(item => (
                <div key={item.id} style={{ background:item.status==="Done"?"rgba(16,185,129,0.04)":"#0F1520",
                  border:`1px solid ${item.status==="Done"?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.06)"}`,
                  borderRadius:10, padding:"14px 18px", opacity:item.status==="Done"?0.7:1, transition:"all 0.2s" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:14, fontWeight:600, color:item.status==="Done"?"#4B5563":"#F1F5F9",
                          textDecoration:item.status==="Done"?"line-through":"none" }}>{item.task}</span>
                        <Badge label={item.service} color="#8B5CF6" />
                        <Badge label={item.impact} color={PRIORITY_COLORS[item.impact]} />
                      </div>
                      <p style={{ fontSize:13, color:"#6B7280", margin:0 }}>{item.description}</p>
                    </div>
                    <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center" }}>
                      {["Done","In Progress","Pending"].map(s => (
                        <StatusBtn key={s} current={item.status} value={s} onChange={()=>updateLawyer(item.id,s)} />
                      ))}
                      {saving===item.id && <span style={{ fontSize:11, color:"#F59E0B" }}>saving...</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
