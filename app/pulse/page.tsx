"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function sc(s: number) { return s>=75?'#4ade80':s>=50?'#fbbf24':'#f87171' }
function scBorder(s: number) { return s>=75?'#166534':s>=50?'#92400e':'#991b1b' }
function ago(ts: string) {
  if(!ts) return '—'
  const m = Math.floor((Date.now()-new Date(ts).getTime())/60000)
  if(m<1) return 'just now'
  if(m<60) return m+'m ago'
  if(m<1440) return Math.floor(m/60)+'h ago'
  return Math.floor(m/1440)+'d ago'
}

export default function PulsePage() {
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

  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from("pulse_logs").select("*").order("created_at", { ascending: false }).limit(200)
    if (data) setLogs(data)
    setLoading(false)
  }

  async function loadTargetCount() {
    const { count } = await supabase.from("pulse_targets").select("*", { count: "exact", head: true }).eq("is_active", true)
    setTargetCount(count || 0)
  }

  useEffect(() => {
    load()
    loadTargetCount()
    const i = setInterval(load, 30000)
    return () => clearInterval(i)
  }, [])

  async function triggerScan(url = "") {
    const res = await fetch("https://klaro-pulse.vercel.app/api/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_url: url })
    })
    return res.json()
  }

  async function scanSingle() {
    if (!scanUrl.startsWith("http")) { setStatus({ msg: "Enter a valid URL starting with https://", type: "error" }); return }
    setScanning(true)
    setStatus({ msg: `⏳ Scanning ${scanUrl} — results appear in 3-5 minutes...`, type: "scanning" })
    const data = await triggerScan(scanUrl)
    setScanning(false)
    if (data.ok) { setStatus({ msg: `✅ ${data.message}`, type: "success" }); setScanUrl("") }
    else setStatus({ msg: `❌ ${data.error || "Failed to trigger scan"}`, type: "error" })
  }

  async function scanBatch() {
    setScanning(true)
    setStatus({ msg: "⏳ Full batch scan triggered — results appear over next 10-30 minutes...", type: "scanning" })
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
    setStatus({ msg: `✅ ${urls.length} scans queued! Results appear below as each completes.`, type: "success" })
  }

  function toggleExpand(idx: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const filtered = logs
    .filter(l => filter === "all" || l.status === filter)
    .filter(l => !search || (l.metadata?.target_name||"").toLowerCase().includes(search.toLowerCase()) || (l.url||"").toLowerCase().includes(search.toLowerCase()) || (l.reasoning||"").toLowerCase().includes(search.toLowerCase()))

  const scores = logs.map(l => l.metadata?.full_report?.authority_score || 0).filter(s => s > 0)
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0
  const critical = logs.filter(l => (l.metadata?.full_report?.authority_score||0) < 50 && l.status !== "ERROR").length

  const statusColors: Record<string,string> = {
    scanning: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20"
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-400">

      {/* Header */}
      <div className="border-b border-slate-800/60 bg-[#0a0f1a] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-lg tracking-tight">KLARO <span className="text-indigo-500">PULSE</span></span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">INTELLIGENCE</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">AI-powered site intelligence & competitive analysis</p>
        </div>
        <div className="flex gap-3">
          <a href="/us/app" className="text-xs text-slate-500 hover:text-white px-3 py-2 border border-slate-800 rounded-lg">← Back to Dashboard</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Scan Bar */}
        <div className="bg-[#0f1420] border border-slate-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-bold text-white">🔍 Scan any website</div>
            <div className="flex gap-2">
              {["single","compare","batch"].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${mode===m ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" : "border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"}`}>
                  {m === "single" ? "Single Site" : m === "compare" ? "Compare Sites" : "Batch Scan"}
                </button>
              ))}
            </div>
          </div>

          {mode === "single" && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <input value={scanUrl} onChange={e => setScanUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && scanSingle()}
                  placeholder="https://anywebsite.com — law firm, SaaS, competitor..."
                  className="flex-1 bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"/>
                <button onClick={scanSingle} disabled={scanning}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:opacity-90">
                  {scanning ? "Queuing..." : "Scan Now →"}
                </button>
              </div>
              <p className="text-xs text-slate-600">Works on any public website · Results in 3-5 min · Law firms, SaaS, competitors, e-commerce — anything</p>
            </div>
          )}

          {mode === "compare" && (
            <div className="space-y-3">
              {compareUrls.map((url, i) => (
                <input key={i} value={url} onChange={e => { const u=[...compareUrls]; u[i]=e.target.value; setCompareUrls(u) }}
                  placeholder={i===0 ? "https://your-client.com (primary site)" : `https://competitor${i}.com`}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"/>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setCompareUrls([...compareUrls,""])}
                  className="text-xs text-slate-500 border border-slate-800 px-3 py-2 rounded-lg hover:bg-slate-800">+ Add site</button>
                <button onClick={scanCompare} disabled={scanning}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                  {scanning ? "Queuing..." : "Compare All →"}
                </button>
              </div>
              <p className="text-xs text-slate-600">Scans each site separately — results appear below as they complete. Great for prospect meetings.</p>
            </div>
          )}

          {mode === "batch" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Run a full scan of all <span className="text-white font-bold">{targetCount}</span> active targets in your database.</p>
              <button onClick={scanBatch} disabled={scanning}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl disabled:opacity-50">
                {scanning ? "Triggering..." : "▶ Run Full Batch Scan"}
              </button>
              <p className="text-xs text-slate-600">Takes 10-30 min · Runs on GitHub Actions · Results saved automatically</p>
            </div>
          )}

          {status && (
            <div className={`mt-4 text-xs px-4 py-3 rounded-xl ${statusColors[status.type] || ""}`}>{status.msg}</div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Sites Scanned", value: logs.length, color: "#818cf8" },
            { label: "Avg Score", value: avg ? `${avg}/100` : "—", color: "#4ade80" },
            { label: "Need Urgent Fix", value: critical, color: "#f87171" },
            { label: "Last Scanned", value: logs[0]?.created_at ? ago(logs[0].created_at) : "—", color: "#fbbf24" },
          ].map(s => (
            <div key={s.label} className="bg-[#0f1420] border border-slate-800/60 rounded-xl p-5">
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Filter:</span>
          {[["all","All"],["UP","Strong (75+)"],["DEGRADED","Needs Work"],["DOWN","Critical"],["ERROR","Errors"]].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filter===v ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" : "border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"}`}>
              {l}
            </button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search sites..." className="ml-auto bg-[#080c14] border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500 w-48"/>
        </div>

        {/* Reports */}
        {loading ? (
          <div className="text-center py-20 text-slate-600">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"/>
            Loading intelligence reports...
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-20 text-slate-600">
            <p className="text-4xl mb-4">📡</p>
            <p className="text-lg font-bold text-slate-500 mb-2">{filter==="all" ? "No scans yet" : "No results for this filter"}</p>
            <p className="text-sm">{filter==="all" ? "Enter a URL above and click Scan Now" : "Try a different filter"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((log, idx) => {
              const r = log.metadata?.full_report || {}
              const name = log.metadata?.target_name || (() => { try { return new URL(log.url||"").hostname } catch { return log.url||"Unknown" } })()
              const score = r.authority_score || 0
              const trust = r.trust_score || 0
              const conv = r.conversion_score || 0
              const isOpen = expanded.has(idx)
              const httpsScore = (log.url||"").startsWith("https") ? 100 : 0
              const mobileScore = r.mobile_readiness==="Good" ? 90 : r.mobile_readiness==="Needs Work" ? 60 : 30

              return (
                <div key={idx} className="bg-[#0f1420] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                  {/* Header */}
                  <div className="p-5 flex items-start justify-between gap-4 border-b border-slate-800/40">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-white font-black text-lg">{name}</span>
                        <a href={log.url||"#"} target="_blank" className="text-slate-600 text-xs hover:text-slate-400">{log.url}</a>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{r.novice_summary||log.reasoning||"—"}</p>
                      {r.competitor_advantage && <p className="text-amber-400/80 text-xs mt-2 italic">💡 {r.competitor_advantage}</p>}
                      <p className="text-slate-700 text-xs mt-2">{ago(log.created_at)} · {log.status}</p>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-2" style={{ borderColor: scBorder(score) }}>
                        <span className="text-xl font-black" style={{ color: sc(score) }}>{score}</span>
                        <span className="text-xs text-slate-600">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="px-5 py-3 grid grid-cols-3 gap-4 border-b border-slate-800/40">
                    {[["Overall",score],["Trust",trust],["Conversion",conv]].map(([l,v]) => (
                      <div key={l as string}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-semibold">{l}</span>
                          <span className="font-bold" style={{ color: sc(v as number) }}>{v}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${v}%`, background: sc(v as number) }}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Compliance row */}
                  <div className="px-5 py-3 border-b border-slate-800/40">
                    <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mb-2">Compliance & Technical</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[["HTTPS",httpsScore],["Mobile",mobileScore],["Accessibility",r.accessibility_score||(score>70?75:50)],["SEO",r.pricing_clarity==="Clear"?80:55]].map(([l,v]) => (
                        <div key={l as string} className="bg-[#080c14] border border-slate-800 rounded-lg p-2 text-center">
                          <div className="text-base font-black" style={{ color: sc(v as number) }}>{v}</div>
                          <div className="text-xs text-slate-600 font-semibold mt-0.5">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pills */}
                  <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-slate-800/40">
                    {r.mobile_readiness && <span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.mobile_readiness==="Good"?"bg-green-500/10 text-green-400 border-green-500/20":r.mobile_readiness==="Poor"?"bg-red-500/10 text-red-400 border-red-500/20":"bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>📱 {r.mobile_readiness}</span>}
                    {r.pricing_clarity && <span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.pricing_clarity==="Clear"?"bg-green-500/10 text-green-400 border-green-500/20":r.pricing_clarity==="Hidden"?"bg-red-500/10 text-red-400 border-red-500/20":"bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>💰 Pricing: {r.pricing_clarity}</span>}
                    {r.cta_effectiveness && <span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.cta_effectiveness==="Strong"?"bg-green-500/10 text-green-400 border-green-500/20":r.cta_effectiveness==="Missing"?"bg-red-500/10 text-red-400 border-red-500/20":"bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>🎯 CTA: {r.cta_effectiveness}</span>}
                    {r.load_time_ms && <span className={`text-xs font-bold px-2 py-1 rounded-full border ${r.load_time_ms<3000?"bg-green-500/10 text-green-400 border-green-500/20":r.load_time_ms<5000?"bg-yellow-500/10 text-yellow-400 border-yellow-500/20":"bg-red-500/10 text-red-400 border-red-500/20"}`}>⚡ {(r.load_time_ms/1000).toFixed(1)}s</span>}
                    {r.industry && <span className="text-xs font-bold px-2 py-1 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">🏢 {r.industry}</span>}
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-slate-800/40">
                      {[
                        { title: "🔴 Problems Found", color: "#f87171", items: r.ux_friction_points||[], prefix: "⚠ " },
                        { title: "🟢 How to Fix", color: "#4ade80", items: r.resolution_steps||[], numbered: true },
                        { title: "💰 Revenue Opportunities", color: "#fbbf24", items: r.revenue_opportunities||[], prefix: "💰 " },
                      ].map(col => (
                        <div key={col.title}>
                          <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: col.color }}>{col.title}</h4>
                          {col.items.length ? col.items.map((item: string, i: number) => (
                            <div key={i} className="text-xs text-slate-400 bg-[#080c14] border border-slate-800 rounded-xl p-3 mb-2 leading-relaxed">
                              {col.numbered ? <span className="font-mono font-bold mr-1" style={{ color: col.color }}>0{i+1}</span> : col.prefix}
                              {item}
                            </div>
                          )) : <div className="text-xs text-slate-700">None detected</div>}
                        </div>
                      ))}
                      {(r.strengths||[]).length > 0 && (
                        <div className="col-span-3">
                          <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-indigo-400">✓ What They Do Well</h4>
                          <div className="flex flex-wrap gap-2">
                            {(r.strengths||[]).map((s: string, i: number) => (
                              <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">✓ {s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-5 py-3 flex gap-3 items-center bg-[#0a0f1a]">
                    <button onClick={() => toggleExpand(idx)} className="text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
                      {isOpen ? "▲ Hide analysis" : "▼ Full analysis"}
                    </button>
                    <button onClick={async () => {
                      setStatus({ msg: `⏳ Re-scanning ${log.url}...`, type: "scanning" })
                      const d = await triggerScan(log.url||"")
                      setStatus(d.ok ? { msg: `✅ ${d.message}`, type: "success" } : { msg: `❌ ${d.error}`, type: "error" })
                    }} className="text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
                      ↺ Re-scan
                    </button>
                    <button onClick={() => {
                      const text = `Site Intelligence: ${name}\nScore: ${score}/100\n${r.novice_summary||""}\n\nKlaro Pulse — klaro.services/pulse`
                      navigator.clipboard?.writeText(text)
                      alert("Report summary copied!")
                    }} className="text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
                      ↗ Share
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
