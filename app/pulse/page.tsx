"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"nimport { isMasterAdmin } from "@/app/lib/admins"

function sc(s: number) { return s>=75?'#4ade80':s>=50?'#fbbf24':'#f87171' }
function scBorder(s: number) { return s>=75?'#166534':s>=50?'#92400e':'#991b1b' }
function ago(ts: string) {
  if(!ts) return '—'
  const m = Math.floor((Date.now()-new Date(ts).getTime())/60000)
  if(m<1) return 'just now'; if(m<60) return m+'m ago'
  if(m<1440) return Math.floor(m/60)+'h ago'
  return Math.floor(m/1440)+'d ago'
}

export default function PulsePage() {
  const supabase = createClient()
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanUrl, setScanUrl] = useState("")
  const [status, setStatus] = useState<{msg:string,type:string}|null>(null)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [targetCount, setTargetCount] = useState(0)
  const [mode, setMode] = useState("single")
  const [compareUrls, setCompareUrls] = useState(["","",""])
  const [activeTab, setActiveTab] = useState<"scans"|"reports"|"admin">("scans")
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setAuthChecked(true); return }
      setUser(session.user)
      setIsAdmin(isMasterAdmin(session.user.email))
      setAuthChecked(true)
      loadLogs()
      loadTargetCount()
      const i = setInterval(loadLogs, 30000)
      return () => clearInterval(i)
    })
  }, [])

  async function loadLogs() {
    const { data } = await supabase.from("pulse_logs").select("*").order("created_at", { ascending: false }).limit(200)
    if (data) setLogs(data)
    setLoading(false)
  }

  async function loadTargetCount() {
    const { count } = await supabase.from("pulse_targets").select("*", { count: "exact", head: true }).eq("is_active", true)
    setTargetCount(count || 0)
  }

  async function loadReports() {
    if (!user) return
    const { data } = await supabase.from("pulse_reports").select("*").eq("created_by", user.id).order("created_at", { ascending: false })
    if (data) setReports(data)
  }

  // AUTH GUARD
  if (!authChecked) return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"/>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-[#0f1420] border border-slate-800 rounded-2xl p-8 text-center">
        <div className="text-white font-black text-xl mb-1">KLARO <span className="text-indigo-500">PULSE</span></div>
        <p className="text-slate-600 text-xs mb-8 uppercase tracking-widest">Site Intelligence Platform</p>
        <p className="text-slate-400 text-sm mb-6">Sign in to your Klaro account to access Pulse.</p>
        <Link href="/signin" className="block w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-90 mb-3">
          Sign in →
        </Link>
        <Link href="/signup" className="block w-full py-3 border border-slate-700 text-slate-400 font-bold rounded-xl text-sm hover:bg-slate-800">
          Create free account →
        </Link>
        <p className="text-slate-700 text-xs mt-4">Your data is completely isolated — no other user can see your scans</p>
      </div>
    </div>
  )

  async function triggerScan(url = "") {
    const res = await fetch("/api/pulse/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_url: url, triggered_by_email: user.email })
    })
    return res.json()
  }

  async function scanSingle() {
    if (!scanUrl.startsWith("http")) { setStatus({ msg: "Enter a valid URL starting with https://", type: "error" }); return }
    setScanning(true)
    setStatus({ msg: `⏳ Scanning ${scanUrl} — results in 3-5 min...`, type: "scanning" })
    const data = await triggerScan(scanUrl)
    setScanning(false)
    if (data.ok) { setStatus({ msg: `✅ ${data.message}`, type: "success" }); setScanUrl("") }
    else setStatus({ msg: `❌ ${data.error || "Failed — check GITHUB_PAT in Vercel env vars"}`, type: "error" })
  }

  async function scanBatch() {
    setScanning(true)
    setStatus({ msg: "⏳ Batch scan triggered — results in 10-30 min...", type: "scanning" })
    const data = await triggerScan("")
    setScanning(false)
    if (data.ok) setStatus({ msg: `✅ ${data.message}`, type: "success" })
    else setStatus({ msg: `❌ ${data.error || "Failed"}`, type: "error" })
  }

  async function scanCompare() {
    const urls = compareUrls.filter(u => u.startsWith("http"))
    if (urls.length < 2) { setStatus({ msg: "Enter at least 2 URLs", type: "error" }); return }
    setScanning(true)
    setStatus({ msg: `⏳ Queuing ${urls.length} scans...`, type: "scanning" })
    for (const url of urls) await triggerScan(url)
    setScanning(false)
    setStatus({ msg: `✅ ${urls.length} scans queued! Results appear as each completes.`, type: "success" })
  }

  async function saveReport(log: any) {
    const r = log.metadata?.full_report || {}
    const name = log.metadata?.target_name || (()=>{ try{ return new URL(log.url||"").hostname }catch{ return log.url||"Unknown" }})()
    const score = r.authority_score || 0
    const { data, error } = await supabase.from("pulse_reports").insert({
      log_id: log.id, target_url: log.url, target_name: name, score,
      report_html: generateReportHtml(log, r, name),
      is_public: false, created_by: user.id,
    }).select().single()
    if (!error && data) alert(`✅ Report saved!\nShare: klaro.services/pulse/report/${data.share_token}`)
    else if (error) alert(`Error: ${error.message}`)
  }

  function generateReportHtml(log: any, r: any, name: string) {
    const score = r.authority_score || 0
    const color = score>=75?"#10b981":score>=50?"#f59e0b":"#ef4444"
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Klaro Pulse — ${name}</title>
<style>body{font-family:-apple-system,sans-serif;background:#f8fafc;color:#1e293b;margin:0;padding:0}
.page{max-width:800px;margin:0 auto;padding:40px 32px}
.hdr{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:28px}
.logo{font-size:18px;font-weight:900}.logo span{color:#6366f1}
.hero{background:#0f172a;border-radius:14px;padding:28px;margin-bottom:24px;color:white}
.score{font-size:48px;font-weight:900;color:${color}}
.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0}
.cell{background:white;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center}
.cv{font-size:20px;font-weight:900}.cl{font-size:10px;color:#64748b;text-transform:uppercase;margin-top:3px}
.sec{font-size:14px;font-weight:800;margin:20px 0 10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
.item{background:white;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:6px;font-size:13px}
.ft{text-align:center;font-size:11px;color:#94a3b8;padding-top:20px;border-top:1px solid #e2e8f0;margin-top:32px}
</style></head><body><div class="page">
<div class="hdr"><div class="logo">KLARO <span>PULSE</span></div><div style="font-size:12px;color:#64748b">${new Date().toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})}</div></div>
<div class="hero">
  <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">Site Intelligence Report</div>
  <div style="font-size:22px;font-weight:800;margin-bottom:4px">${name}</div>
  <div style="color:#94a3b8;font-size:13px;margin-bottom:16px">${log.url}</div>
  <div class="score">${score}<span style="font-size:20px;color:#64748b">/100</span></div>
</div>
<div style="font-size:14px;color:#334155;line-height:1.7;margin-bottom:20px;background:white;border:1px solid #e2e8f0;border-radius:10px;padding:16px">${r.novice_summary||"—"}</div>
<div class="grid">
  <div class="cell"><div class="cv" style="color:${(log.url||"").startsWith("https")?"#10b981":"#ef4444"}">${(log.url||"").startsWith("https")?100:0}</div><div class="cl">HTTPS</div></div>
  <div class="cell"><div class="cv" style="color:${r.mobile_readiness==="Good"?"#10b981":r.mobile_readiness==="Poor"?"#ef4444":"#f59e0b"}">${r.mobile_readiness==="Good"?90:r.mobile_readiness==="Poor"?30:60}</div><div class="cl">Mobile</div></div>
  <div class="cell"><div class="cv" style="color:${(r.trust_score||0)>=75?"#10b981":(r.trust_score||0)>=50?"#f59e0b":"#ef4444"}">${r.trust_score||"—"}</div><div class="cl">Trust</div></div>
</div>
${(r.ux_friction_points||[]).length?`<div class="sec">🔴 Problems Found</div>${(r.ux_friction_points||[]).map((p:string)=>`<div class="item">⚠ ${p}</div>`).join("")}`:""}
${(r.resolution_steps||[]).length?`<div class="sec">🟢 How to Fix</div>${(r.resolution_steps||[]).map((s:string,i:number)=>`<div class="item"><b>0${i+1}.</b> ${s}</div>`).join("")}`:""}
${(r.revenue_opportunities||[]).length?`<div class="sec">💰 Revenue Opportunities</div>${(r.revenue_opportunities||[]).map((o:string)=>`<div class="item">💰 ${o}</div>`).join("")}`:""}
${r.competitor_advantage?`<div class="sec">⚔ Competitive Insight</div><div class="item" style="background:#fef3c7;border-color:#fde68a">💡 ${r.competitor_advantage}</div>`:""}
<div class="ft">Generated by Klaro Pulse · klaro.services/pulse · © ${new Date().getFullYear()} Klaro Global</div>
</div></body></html>`
  }

  function toggleExpand(idx: number) {
    setExpanded(prev => { const n = new Set(prev); n.has(idx)?n.delete(idx):n.add(idx); return n })
  }

  const filtered = logs
    .filter(l => filter==="all" || l.status===filter)
    .filter(l => !search || (l.metadata?.target_name||"").toLowerCase().includes(search.toLowerCase()) || (l.url||"").toLowerCase().includes(search.toLowerCase()))

  const scores = logs.map(l=>l.metadata?.full_report?.authority_score||0).filter(s=>s>0)
  const avg = scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0

  const statusStyle: Record<string,string> = {
    scanning:"bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    success:"bg-green-500/10 text-green-400 border border-green-500/20",
    error:"bg-red-500/10 text-red-400 border border-red-500/20"
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-400">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-[#0a0f1a] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-lg">KLARO <span className="text-indigo-500">PULSE</span></span>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">INTELLIGENCE</span>
          {isAdmin && <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">MASTER ADMIN</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">{user.email}</span>
          <Link href="/in/ca" className="text-xs text-slate-500 hover:text-white px-3 py-1.5 border border-slate-800 rounded-lg">CA Suite</Link>
          <Link href="/in/lawyer" className="text-xs text-slate-500 hover:text-white px-3 py-1.5 border border-slate-800 rounded-lg">Lawyer Suite</Link>
          <button onClick={async()=>{await supabase.auth.signOut();window.location.href="/signin"}}
            className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-900/30 rounded-lg">Sign out</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-800">
          {(["scans","reports",...(isAdmin?["admin"]:[])]).map(t=>(
            <button key={t} onClick={()=>{ setActiveTab(t as any); if(t==="reports") loadReports() }}
              className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px capitalize transition-colors ${activeTab===t?"border-indigo-500 text-white":"border-transparent text-slate-500 hover:text-slate-300"}`}>
              {t==="scans"?"🔍 Site Scans":t==="reports"?"📄 Saved Reports":"👑 Admin"}
            </button>
          ))}
        </div>

        {/* SCANS TAB */}
        {activeTab==="scans" && <>
          {/* Scan Bar */}
          <div className="bg-[#0f1420] border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm font-bold text-white">🔍 Scan any website</div>
              <div className="flex gap-2">
                {[["single","Single"],["compare","Compare"],["batch","Batch"]].map(([m,l])=>(
                  <button key={m} onClick={()=>setMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${mode===m?"bg-indigo-500/10 text-indigo-400 border-indigo-500/30":"border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {mode==="single" && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input value={scanUrl} onChange={e=>setScanUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scanSingle()}
                    placeholder="https://anywebsite.com — law firm, SaaS, competitor..."
                    className="flex-1 bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"/>
                  <button onClick={scanSingle} disabled={scanning}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                    {scanning?"Queuing...":"Scan Now →"}
                  </button>
                </div>
                <p className="text-xs text-slate-600">Works on any public website · Results in 3-5 min · No login to target needed</p>
              </div>
            )}

            {mode==="compare" && (
              <div className="space-y-3">
                {compareUrls.map((url,i)=>(
                  <input key={i} value={url} onChange={e=>{const u=[...compareUrls];u[i]=e.target.value;setCompareUrls(u)}}
                    placeholder={i===0?"https://your-client.com (primary)":`https://competitor${i}.com`}
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"/>
                ))}
                <div className="flex gap-3">
                  <button onClick={()=>setCompareUrls([...compareUrls,""])} className="text-xs text-slate-500 border border-slate-800 px-3 py-2 rounded-lg hover:bg-slate-800">+ Add</button>
                  <button onClick={scanCompare} disabled={scanning} className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                    {scanning?"Queuing...":"Compare All →"}
                  </button>
                </div>
              </div>
            )}

            {mode==="batch" && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">Scan all <span className="text-white font-bold">{targetCount}</span> active targets in database.</p>
                <button onClick={scanBatch} disabled={scanning} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                  {scanning?"Triggering...":"▶ Run Full Batch Scan"}
                </button>
              </div>
            )}

            {status && <div className={`mt-4 text-xs px-4 py-3 rounded-xl ${statusStyle[status.type]||""}`}>{status.msg}</div>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {label:"Sites Scanned",value:logs.length,color:"#818cf8"},
              {label:"Avg Score",value:avg?`${avg}/100`:"—",color:"#4ade80"},
              {label:"Need Urgent Fix",value:logs.filter(l=>(l.metadata?.full_report?.authority_score||0)<50&&l.status!=="ERROR").length,color:"#f87171"},
              {label:"Last Scanned",value:logs[0]?.created_at?ago(logs[0].created_at):"—",color:"#fbbf24"},
            ].map(s=>(
              <div key={s.label} className="bg-[#0f1420] border border-slate-800/60 rounded-xl p-5">
                <div className="text-2xl font-black" style={{color:s.color}}>{s.value}</div>
                <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Filter:</span>
            {[["all","All"],["UP","Strong (75+)"],["DEGRADED","Needs Work"],["DOWN","Critical"],["ERROR","Errors"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filter===v?"bg-indigo-500/10 text-indigo-400 border-indigo-500/30":"border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"}`}>
                {l}
              </button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sites..."
              className="ml-auto bg-[#080c14] border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500 w-48"/>
          </div>

          {/* Report Cards */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"/>
              <div className="text-slate-600 text-sm">Loading intelligence reports...</div>
            </div>
          ) : !filtered.length ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4 opacity-30">📡</p>
              <p className="text-slate-500 font-bold mb-2">{filter==="all"?"No scans yet":"No results for this filter"}</p>
              <p className="text-slate-700 text-sm">{filter==="all"?"Enter a URL above and click Scan Now":"Try a different filter"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((log,idx)=>{
                const r = log.metadata?.full_report||{}
                const name = log.metadata?.target_name||(()=>{try{return new URL(log.url||"").hostname}catch{return log.url||"Unknown"}})()
                const score = r.authority_score||0
                const isOpen = expanded.has(idx)
                const httpsScore = (log.url||"").startsWith("https")?100:0
                const mobileScore = r.mobile_readiness==="Good"?90:r.mobile_readiness==="Needs Work"?60:30
                const socScore = httpsScore===100&&mobileScore>=60?80:45

                return (
                  <div key={idx} className="bg-[#0f1420] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                    <div className="p-5 flex items-start justify-between gap-4 border-b border-slate-800/40">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="text-white font-black text-lg">{name}</span>
                          <a href={log.url||"#"} target="_blank" className="text-slate-600 text-xs hover:text-slate-400">{log.url}</a>
                          {isAdmin&&log.triggered_by_email&&<span className="text-xs text-amber-400/60">by {log.triggered_by_email}</span>}
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{r.novice_summary||log.reasoning||"—"}</p>
                        {r.competitor_advantage&&<p className="text-amber-400/80 text-xs mt-2 italic">💡 {r.competitor_advantage}</p>}
                        <p className="text-slate-700 text-xs mt-2">{ago(log.created_at)} · {log.status}</p>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-2" style={{borderColor:scBorder(score)}}>
                          <span className="text-xl font-black" style={{color:sc(score)}}>{score}</span>
                          <span className="text-xs text-slate-600">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Score bars */}
                    <div className="px-5 py-3 grid grid-cols-3 gap-4 border-b border-slate-800/40">
                      {[["Overall",score],["Trust",r.trust_score||0],["Conversion",r.conversion_score||0]].map(([l,v])=>(
                        <div key={l as string}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500 font-semibold">{l}</span>
                            <span className="font-bold" style={{color:sc(v as number)}}>{v}/100</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${v}%`,background:sc(v as number)}}/>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Compliance */}
                    <div className="px-5 py-3 border-b border-slate-800/40">
                      <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mb-2">Compliance & Security Surface</div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          ["HTTPS",httpsScore,"Security"],
                          ["Mobile",mobileScore,"Accessibility"],
                          ["ADA/WCAG",score>70?75:45,"Legal"],
                          ["SOC2 Surface",socScore,"Compliance"],
                        ].map(([l,v,cat])=>(
                          <div key={l as string} className="bg-[#080c14] border border-slate-800 rounded-lg p-2 text-center">
                            <div className="text-base font-black" style={{color:sc(v as number)}}>{v}</div>
                            <div className="text-xs text-slate-600 font-semibold mt-0.5">{l}</div>
                            <div className="text-xs text-slate-700">{cat}</div>
                          </div>
                        ))}
                      </div>
                      {socScore<80&&<div className="mt-2 text-xs text-amber-400/70 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
                        ⚠ SOC2 surface issues detected — full audit recommended
                      </div>}
                    </div>

                    {/* Pills */}
                    <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-slate-800/40">
                      {r.mobile_readiness&&<span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.mobile_readiness==="Good"?"bg-green-500/10 text-green-400 border-green-500/20":r.mobile_readiness==="Poor"?"bg-red-500/10 text-red-400 border-red-500/20":"bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>📱 {r.mobile_readiness}</span>}
                      {r.pricing_clarity&&<span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.pricing_clarity==="Clear"?"bg-green-500/10 text-green-400 border-green-500/20":r.pricing_clarity==="Hidden"?"bg-red-500/10 text-red-400 border-red-500/20":"bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>💰 {r.pricing_clarity}</span>}
                      {r.cta_effectiveness&&<span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.cta_effectiveness==="Strong"?"bg-green-500/10 text-green-400 border-green-500/20":r.cta_effectiveness==="Missing"?"bg-red-500/10 text-red-400 border-red-500/20":"bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>🎯 {r.cta_effectiveness}</span>}
                      {r.load_time_ms&&<span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.load_time_ms<3000?"bg-green-500/10 text-green-400 border-green-500/20":r.load_time_ms<5000?"bg-yellow-500/10 text-yellow-400 border-yellow-500/20":"bg-red-500/10 text-red-400 border-red-500/20"}`}>⚡ {(r.load_time_ms/1000).toFixed(1)}s</span>}
                      {r.industry&&<span className="text-xs font-bold px-2 py-1 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">🏢 {r.industry}</span>}
                    </div>

                    {/* Expanded */}
                    {isOpen&&(
                      <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-slate-800/40">
                        {[
                          {title:"🔴 Problems Found",color:"#f87171",items:r.ux_friction_points||[],prefix:"⚠ "},
                          {title:"🟢 How to Fix",color:"#4ade80",items:r.resolution_steps||[],numbered:true},
                          {title:"💰 Revenue Opportunities",color:"#fbbf24",items:r.revenue_opportunities||[],prefix:"💰 "},
                        ].map(col=>(
                          <div key={col.title}>
                            <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{color:col.color}}>{col.title}</h4>
                            {col.items.length?col.items.map((item:string,i:number)=>(
                              <div key={i} className="text-xs text-slate-400 bg-[#080c14] border border-slate-800 rounded-xl p-3 mb-2 leading-relaxed">
                                {col.numbered?<span className="font-mono font-bold mr-1" style={{color:col.color}}>0{i+1}</span>:col.prefix}{item}
                              </div>
                            )):<div className="text-xs text-slate-700">None detected</div>}
                          </div>
                        ))}
                        {(r.strengths||[]).length>0&&(
                          <div className="col-span-3">
                            <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-indigo-400">✓ What They Do Well</h4>
                            <div className="flex flex-wrap gap-2">
                              {(r.strengths||[]).map((s:string,i:number)=>(
                                <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">✓ {s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="px-5 py-3 flex gap-3 items-center bg-[#0a0f1a]">
                      <button onClick={()=>toggleExpand(idx)} className="text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
                        {isOpen?"▲ Hide":"▼ Full analysis"}
                      </button>
                      <button onClick={()=>saveReport(log)} className="text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
                        💾 Save Report
                      </button>
                      <button onClick={async()=>{
                        setStatus({msg:`⏳ Re-scanning ${log.url}...`,type:"scanning"})
                        const d=await triggerScan(log.url||"")
                        setStatus(d.ok?{msg:`✅ ${d.message}`,type:"success"}:{msg:`❌ ${d.error}`,type:"error"})
                      }} className="text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
                        ↺ Re-scan
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>}

        {/* REPORTS TAB */}
        {activeTab==="reports"&&(
          <div className="space-y-4">
            {!reports.length?(
              <div className="text-center py-20">
                <p className="text-4xl mb-4 opacity-30">📄</p>
                <p className="text-slate-500 font-bold mb-2">No saved reports yet</p>
                <p className="text-slate-700 text-sm">Click "Save Report" on any scan to save it here</p>
              </div>
            ):reports.map(r=>(
              <div key={r.id} className="bg-[#0f1420] border border-slate-800/60 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-white font-bold">{r.target_name}</div>
                  <div className="text-slate-600 text-xs mt-1">{r.target_url}</div>
                  <div className="text-slate-700 text-xs mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-xl font-black" style={{color:r.score>=75?"#4ade80":r.score>=50?"#fbbf24":"#f87171"}}>{r.score}/100</div>
                  <button onClick={async()=>{
                    await supabase.from("pulse_reports").update({is_public:!r.is_public}).eq("id",r.id)
                    setReports(prev=>prev.map(x=>x.id===r.id?{...x,is_public:!x.is_public}:x))
                  }} className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${r.is_public?"bg-green-500/10 text-green-400 border-green-500/20":"border-slate-800 text-slate-500"}`}>
                    {r.is_public?"🌐 Public":"🔒 Private"}
                  </button>
                  {r.is_public&&(
                    <button onClick={()=>{navigator.clipboard?.writeText(`https://klaro.services/pulse/report/${r.share_token}`);alert("Link copied!")}}
                      className="text-xs px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-bold">
                      ↗ Copy Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab==="admin"&&isAdmin&&(
          <div className="space-y-6">
            <div className="bg-[#0f1420] border border-slate-800/60 rounded-xl p-5">
              <h3 className="text-white font-bold mb-4">Scan Activity by User</h3>
              {(()=>{
                const byUser: Record<string,number> = {}
                logs.forEach(l=>{ const e=l.triggered_by_email||"agent/system"; byUser[e]=(byUser[e]||0)+1 })
                return Object.entries(byUser).sort((a,b)=>b[1]-a[1]).map(([email,count])=>(
                  <div key={email} className="flex items-center justify-between py-2 border-b border-slate-800/40">
                    <span className="text-sm text-slate-300">{email}</span>
                    <span className="text-xs font-bold text-indigo-400">{count} scans</span>
                  </div>
                ))
              })()}
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-400/80">
              ℹ️ Viewing scan activity is permitted as platform usage data. Users are informed in your Terms of Service.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
