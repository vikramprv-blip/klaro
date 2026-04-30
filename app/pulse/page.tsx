"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { isMasterAdmin } from "@/app/lib/admins"

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
  const [activeSection, setActiveSection] = useState<Record<number,string>>({})
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

  async function downloadPDF(log: any) {
    const r = log.metadata?.full_report || {}
    const name = log.metadata?.target_name || (()=>{ try{ return new URL(log.url||"").hostname }catch{ return "Unknown" }})()
    const score = r.overall_score || r.authority_score || r.lam_score || 0
    const trust = r.ux_conversion_audit?.trust_score || r.trust_score || 0
    const conv = r.ux_conversion_audit?.conversion_score || r.conversion_score || 0
    const httpsScore = (log.url||"").startsWith("https") ? 100 : 0
    const mobileScore = r.mobile_readiness==="Good"?90:r.mobile_readiness==="Needs Work"?60:30
    const eb = r.executive_brief || {}
    const sec = r.security_compliance || {}
    const ux = r.ux_conversion_audit || {}
    const ci = r.competitive_intelligence || {}
    const rm = r.ninety_day_roadmap || {}
    const isLAM = r.report_type === "LAM"
    const date = new Date().toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})

    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const W = 210, M = 16, CW = W - M * 2

    const hex = (h: string): [number,number,number] => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]
    const scoreCol = (s: number) => s>=75?"#10b981":s>=50?"#f59e0b":"#ef4444"
    const scoreBgHex = (s: number) => s>=75?"#052e16":s>=50?"#1c1505":"#1c0505"

    function addHeader(pageNum: number, totalPages: number, pageTitle: string) {
      doc.setFillColor(10,15,26)
      doc.rect(0,0,W,14,"F")
      doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont("helvetica","bold")
      doc.text("KLARO", M, 9)
      const kw = doc.getTextWidth("KLARO")
      doc.setTextColor(99,102,241)
      doc.text(" PULSE", M+kw, 9)
      doc.setTextColor(100,116,139); doc.setFontSize(7); doc.setFont("helvetica","normal")
      doc.text(pageTitle.toUpperCase(), M+42, 9)
      doc.text(`Page ${pageNum} of ${totalPages}  |  ${date}  |  CONFIDENTIAL`, W-M, 9, {align:"right"})
      doc.setDrawColor(30,42,58); doc.setLineWidth(0.3); doc.line(0,14,W,14)
    }

    function addFooter() {
      doc.setFillColor(15,22,38); doc.rect(0,284,W,13,"F")
      doc.setDrawColor(99,102,241); doc.line(0,284,W,284)
      doc.setTextColor(200,210,230); doc.setFontSize(7); doc.setFont("helvetica","normal")
      doc.text(`${name}  |  ${log.url||""}  |  Klaro Pulse Site Intelligence`, M, 291)
      doc.setTextColor(200,210,230)
      doc.text(`klaro.services/pulse  |  (c) ${new Date().getFullYear()} Klaro Global`, W-M, 291, {align:"right"})
    }

    function addSectionTitle(title: string, y: number, color: string = "#818cf8"): number {
      const rgb = hex(color)
      doc.setTextColor(rgb[0],rgb[1],rgb[2]); doc.setFontSize(9); doc.setFont("helvetica","bold")
      doc.text(title, M, y)
      doc.setDrawColor(rgb[0],rgb[1],rgb[2]); doc.setLineWidth(0.3)
      doc.line(M, y+2, W-M, y+2)
      return y + 8
    }

    function scoreCard(x: number, y: number, w: number, h: number, value: number, label: string, big: boolean = false) {
      const sc = hex(scoreBgHex(value)); const tc = hex(scoreCol(value)); const bc = hex(scoreCol(value))
      doc.setFillColor(sc[0],sc[1],sc[2]); doc.setDrawColor(bc[0],bc[1],bc[2]); doc.setLineWidth(0.5)
      doc.roundedRect(x,y,w,h,3,3,"FD")
      doc.setTextColor(tc[0],tc[1],tc[2]); doc.setFontSize(big?22:14); doc.setFont("helvetica","bold")
      doc.text(String(value), x+w/2, y+h*0.55, {align:"center"})
      doc.setTextColor(100,116,139); doc.setFontSize(6); doc.setFont("helvetica","normal")
      doc.text(label, x+w/2, y+h*0.82, {align:"center"})
    }

    function textBox(x: number, y: number, w: number, text: string, bgHex: string, borderHex: string, titleColor: string, title: string): number {
      const lines = doc.splitTextToSize(text, w-10)
      const h = lines.length * 4.5 + (title ? 14 : 8)
      const bg = hex(bgHex); const br = hex(borderHex)
      doc.setFillColor(bg[0],bg[1],bg[2]); doc.setDrawColor(br[0],br[1],br[2]); doc.setLineWidth(0.3)
      doc.roundedRect(x,y,w,h,3,3,"FD")
      if (title) {
        const tc = hex(titleColor)
        doc.setTextColor(tc[0],tc[1],tc[2]); doc.setFontSize(7); doc.setFont("helvetica","bold")
        doc.text(title, x+4, y+7)
        doc.setTextColor(203,213,225); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, x+4, y+13)
      } else {
        doc.setTextColor(203,213,225); doc.setFontSize(7); doc.setFont("helvetica","normal")
        doc.text(lines, x+4, y+6)
      }
      return h
    }

    // ═══════════════════════════════════════
    // PAGE 1 — EXECUTIVE BRIEF
    // ═══════════════════════════════════════
    addHeader(1, 5, "Executive Brief")
    let y = 22

    // Site name + score hero
    doc.setFillColor(8,12,20); doc.rect(0,14,W,40,"F")
    doc.setTextColor(255,255,255); doc.setFontSize(20); doc.setFont("helvetica","bold")
    doc.text(name, M, y+8)
    doc.setTextColor(71,85,105); doc.setFontSize(8); doc.setFont("helvetica","normal")
    doc.text(log.url||"", M, y+15)
    if (r.industry) {
      doc.setFillColor(15,26,58); doc.setDrawColor(63,72,180)
      const iw = doc.getTextWidth(r.industry)+8
      doc.roundedRect(M, y+18, iw, 7, 2, 2, "FD")
      doc.setTextColor(129,140,248); doc.setFontSize(6.5); doc.setFont("helvetica","bold")
      doc.text(r.industry, M+4, y+23)
    }
    if (isLAM) {
      doc.setFillColor(5,46,22); doc.setDrawColor(16,185,129)
      doc.roundedRect(M+doc.getTextWidth(r.industry||"")+12, y+18, 28, 7, 2, 2, "FD")
      doc.setTextColor(74,222,128); doc.setFontSize(6.5); doc.setFont("helvetica","bold")
      doc.text("LAM AUDIT", M+doc.getTextWidth(r.industry||"")+16, y+23)
    }

    // Score cards row
    const cards = [
      {label:"OVERALL",value:score,big:true},
      {label:"TRUST",value:trust},
      {label:"CONVERSION",value:conv},
      {label:"SECURITY",value:sec.security_score||(httpsScore===100?75:40)},
      {label:"MOBILE",value:mobileScore},
    ]
    const bigW = 44, sW = (CW-bigW-12)/4
    let cx = M
    cards.forEach((c,i) => { scoreCard(cx, y+28, i===0?bigW:sW, 22, c.value, c.label, i===0); cx += (i===0?bigW:sW)+3 })
    y = 68

    // Grade + urgency badges
    const grade = r.grade || (score>=90?"A":score>=75?"B":score>=60?"C":score>=50?"D":"F")
    const urgency = eb.urgency || "Medium"
    const urgencyColors: Record<string,string> = {Low:"#10b981",Medium:"#f59e0b",High:"#ef4444",Critical:"#dc2626"}
    const uc = hex(urgencyColors[urgency]||"#f59e0b")
    doc.setFillColor(hex(scoreBgHex(score))[0],hex(scoreBgHex(score))[1],hex(scoreBgHex(score))[2])
    doc.setDrawColor(hex(scoreCol(score))[0],hex(scoreCol(score))[1],hex(scoreCol(score))[2])
    doc.setLineWidth(0.4); doc.roundedRect(M, y, 22, 8, 2, 2, "FD")
    doc.setTextColor(hex(scoreCol(score))[0],hex(scoreCol(score))[1],hex(scoreCol(score))[2])
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.text(`Grade: ${grade}`, M+11, y+5.5, {align:"center"})
    doc.setFillColor(uc[0]>100?28:5, uc[1]>100?21:5, uc[2]>100?5:28)
    doc.setDrawColor(uc[0],uc[1],uc[2]); doc.roundedRect(M+26, y, 28, 8, 2, 2, "FD")
    doc.setTextColor(uc[0],uc[1],uc[2]); doc.text(`Urgency: ${urgency}`, M+40, y+5.5, {align:"center"})
    y += 14

    // Verdict box
    if (eb.one_line_verdict) {
      const h = textBox(M, y, CW, `"${eb.one_line_verdict}"`, "#1c1505", "#92400e", "#fbbf24", "EXECUTIVE VERDICT")
      y += h + 5
    }

    // Summary
    if (eb.plain_english_summary || r.novice_summary) {
      const h = textBox(M, y, CW, eb.plain_english_summary||r.novice_summary||"", "#0f1420", "#1e2a3a", "#94a3b8", "ANALYSIS SUMMARY")
      y += h + 5
    }

    // Revenue impact
    if (eb.estimated_revenue_impact) {
      const h = textBox(M, y, CW, `Revenue Impact: ${eb.estimated_revenue_impact}`, "#052e16", "#166534", "#4ade80", "")
      y += h + 5
    }

    // Top 3 actions
    if ((eb.top_3_actions||[]).length > 0) {
      y = addSectionTitle("PRIORITY ACTIONS", y, "#818cf8")
      const actionColors = ["#10b981","#f59e0b","#818cf8"]
      const actionBgs = ["#052e16","#1c1505","#0c1230"]
      const actionBorders = ["#166534","#92400e","#312e81"]
      const actionLabels = ["THIS WEEK","THIS MONTH","THIS QUARTER"];
      (eb.top_3_actions||[]).slice(0,3).forEach((action: string, i: number) => {
        const ac = hex(actionColors[i]); const ab = hex(actionBgs[i]); const abr = hex(actionBorders[i])
        const lines = doc.splitTextToSize(action, CW-38)
        const h = lines.length * 4.5 + 8
        doc.setFillColor(ab[0],ab[1],ab[2]); doc.setDrawColor(abr[0],abr[1],abr[2]); doc.setLineWidth(0.3)
        doc.roundedRect(M, y, CW, h, 2, 2, "FD")
        doc.setFillColor(ac[0],ac[1],ac[2]); doc.roundedRect(M+2, y+2, 22, h-4, 1, 1, "F")
        doc.setTextColor(8,12,20); doc.setFontSize(5.5); doc.setFont("helvetica","bold")
        doc.text(actionLabels[i], M+13, y+h/2+1, {align:"center"})
        doc.setTextColor(220,230,240); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, M+28, y+6)
        y += h + 3
      })
    }

    addFooter()

    // ═══════════════════════════════════════
    // PAGE 2 — UX & CONVERSION AUDIT
    // ═══════════════════════════════════════
    doc.addPage()
    addHeader(2, 5, "UX & Conversion Audit")
    y = 22

    // Score bars
    y = addSectionTitle("PERFORMANCE SCORES", y, "#818cf8")
    const bars = [
      ["Overall Score", score],
      ["Trust & Credibility", trust],
      ["Conversion Rate", conv],
      ["Security Surface", sec.security_score||(httpsScore===100?75:40)],
    ]
    bars.forEach(([label, val]) => {
      doc.setTextColor(180,190,210); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
      doc.text(label as string, M, y+4)
      doc.setTextColor(hex(scoreCol(val as number))[0],hex(scoreCol(val as number))[1],hex(scoreCol(val as number))[2])
      doc.setFontSize(7.5); doc.setFont("helvetica","bold")
      doc.text(`${val}/100`, W-M, y+4, {align:"right"})
      doc.setFillColor(25,30,45); doc.rect(M, y+6, CW, 4, "F")
      const fc = hex(scoreCol(val as number))
      doc.setFillColor(fc[0],fc[1],fc[2]); doc.rect(M, y+6, CW*(val as number)/100, 4, "F")
      y += 13
    })
    y += 4

    // Issues
    const issues = ux.issues || []
    if (issues.length > 0) {
      y = addSectionTitle("CONVERSION KILLERS — DETAILED ANALYSIS", y, "#ef4444")
      issues.slice(0,5).forEach((issue: any) => {
        const priorityColors: Record<string,string> = {Critical:"#ef4444",High:"#f97316",Medium:"#f59e0b",Low:"#94a3b8"}
        const pc = hex(priorityColors[issue.priority]||"#f59e0b")
        const pbg = issue.priority==="Critical"?hex("#1c0505"):issue.priority==="High"?hex("#1c0a05"):hex("#0f1420")
        const issueLines = doc.splitTextToSize(issue.issue||"", CW-50)
        const fixLines = doc.splitTextToSize(`Fix: ${issue.fix||""}`, CW-12)
        const impactLines = doc.splitTextToSize(`Impact: ${issue.business_impact||""}`, CW-12)
        const h = issueLines.length*4.5 + fixLines.length*4 + impactLines.length*4 + 18
        doc.setFillColor(pbg[0],pbg[1],pbg[2]); doc.setDrawColor(pc[0],pc[1],pc[2]); doc.setLineWidth(0.4)
        doc.roundedRect(M, y, CW, h, 3, 3, "FD")
        // Priority badge
        doc.setFillColor(pc[0],pc[1],pc[2]); doc.roundedRect(M+3, y+3, 20, 6, 1, 1, "F")
        doc.setTextColor(8,12,20); doc.setFontSize(5.5); doc.setFont("helvetica","bold")
        doc.text((issue.priority||"").toUpperCase(), M+13, y+7, {align:"center"})
        // Issue title
        doc.setTextColor(240,240,250); doc.setFontSize(8); doc.setFont("helvetica","bold")
        doc.text(issueLines, M+27, y+7)
        let iy = y + 7 + issueLines.length*4.5
        // Fix
        doc.setTextColor(74,222,128); doc.setFontSize(7); doc.setFont("helvetica","normal")
        doc.text(fixLines, M+4, iy+2)
        iy += fixLines.length*4+4
        // Impact
        doc.setTextColor(251,191,36); doc.setFontSize(7)
        doc.text(impactLines, M+4, iy)
        // Effort + cost
        if (issue.effort||issue.cost) {
          doc.setTextColor(100,116,139); doc.setFontSize(6)
          doc.text(`${issue.effort||""} · ${issue.cost||""}`.trim(), W-M-4, y+7, {align:"right"})
        }
        y += h + 4
        if (y > 270) { doc.addPage(); addHeader(2,5,"UX & Conversion Audit (cont.)"); y = 22 }
      })
    }

    // Quick wins
    if ((ux.quick_wins||[]).length > 0) {
      y = addSectionTitle("QUICK WINS — FREE, UNDER 1 HOUR", y, "#10b981")
      ;(ux.quick_wins||[]).forEach((win: string) => {
        const lines = doc.splitTextToSize(`+ ${win}`, CW-8)
        doc.setFillColor(5,30,20); doc.setDrawColor(22,101,52); doc.setLineWidth(0.3)
        doc.roundedRect(M, y, CW, lines.length*4.5+6, 2, 2, "FD")
        doc.setTextColor(74,222,128); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, M+4, y+5)
        y += lines.length*4.5+9
      })
    }

    addFooter()

    // ═══════════════════════════════════════
    // PAGE 3 — COMPETITIVE INTELLIGENCE
    // ═══════════════════════════════════════
    doc.addPage()
    addHeader(3, 5, "Competitive Intelligence")
    y = 22

    // Market position
    if (ci.market_position) {
      y = addSectionTitle("MARKET POSITION ANALYSIS", y, "#818cf8")
      const h = textBox(M, y, CW, ci.market_position, "#0f1420", "#1e2a3a", "#94a3b8", "")
      y += h + 8
    }

    // Where losing clients
    if (ci.where_losing_clients) {
      y = addSectionTitle("WHY CLIENTS CHOOSE COMPETITORS", y, "#ef4444")
      const h = textBox(M, y, CW, ci.where_losing_clients, "#1c0505", "#991b1b", "#f87171", "")
      y += h + 8
    }

    // Competitor advantage
    if (ci.biggest_competitor_advantage) {
      y = addSectionTitle("BIGGEST COMPETITOR ADVANTAGE", y, "#f97316")
      const h = textBox(M, y, CW, ci.biggest_competitor_advantage, "#1c0a05", "#9a3412", "#fb923c", "")
      y += h + 8
    }

    // Opportunity
    if (ci.opportunity_to_win) {
      y = addSectionTitle("YOUR OPPORTUNITY TO WIN", y, "#10b981")
      const h = textBox(M, y, CW, ci.opportunity_to_win, "#052e16", "#166534", "#4ade80", "")
      y += h + 8
    }

    // Competitors scanned
    if ((r.competitors_scanned||[]).length > 0) {
      y = addSectionTitle("SITES COMPARED IN THIS ANALYSIS", y, "#475569")
      doc.setFillColor(10,15,26); doc.setDrawColor(30,42,58); doc.setLineWidth(0.3)
      doc.roundedRect(M, y, CW, 10, 2, 2, "FD")
      doc.setTextColor(100,116,139); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
      doc.text(r.competitors_scanned.join("  ·  "), M+4, y+6.5)
      y += 18
    }

    // Strengths
    if ((r.strengths||[]).length > 0) {
      y = addSectionTitle("WHAT THIS SITE DOES WELL", y, "#818cf8")
      ;(r.strengths||[]).forEach((s: string) => {
        const lines = doc.splitTextToSize(`+ ${s}`, CW-8)
        doc.setFillColor(12,18,40); doc.setDrawColor(49,46,129); doc.setLineWidth(0.3)
        doc.roundedRect(M, y, CW, lines.length*4.5+6, 2, 2, "FD")
        doc.setTextColor(165,180,252); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, M+4, y+5)
        y += lines.length*4.5+9
      })
    }

    addFooter()

    // ═══════════════════════════════════════
    // PAGE 4 — SECURITY & COMPLIANCE
    // ═══════════════════════════════════════
    doc.addPage()
    addHeader(4, 5, "Security & Compliance")
    y = 22

    // Security scores grid
    y = addSectionTitle("COMPLIANCE SURFACE SCAN", y, "#818cf8")
    const compItems = [
      {label:"HTTPS / SSL", value:httpsScore, detail: httpsScore===100?"Valid SSL certificate, HTTPS enforced":"Missing SSL — critical security risk"},
      {label:"Mobile / ADA", value:mobileScore, detail: r.mobile_readiness||"Mobile experience assessment"},
      {label:"Cookie Consent", value:sec.cookie_consent?90:15, detail: sec.cookie_consent?"Cookie consent banner detected":"No cookie consent — GDPR/DPDP violation risk"},
      {label:"Privacy Policy", value:sec.privacy_policy?90:20, detail: sec.privacy_policy?"Privacy policy page found":"No privacy policy — legal requirement"},
      {label:"SOC2 Readiness", value:sec.soc2_readiness==="Ready"?90:sec.soc2_readiness==="Partial"?60:30, detail: sec.soc2_readiness||"SOC2 surface assessment"},
      {label:"GDPR Status", value:sec.gdpr_compliance==="Compliant"?90:sec.gdpr_compliance==="Partial"?60:25, detail: sec.gdpr_compliance||"GDPR compliance surface check"},
    ]
    const gridW = (CW-8)/3
    compItems.forEach((item, i) => {
      const gx = M + (i%3)*(gridW+4)
      const gy = y + Math.floor(i/3)*28
      const vc = hex(scoreCol(item.value)); const vbg = hex(scoreBgHex(item.value))
      doc.setFillColor(vbg[0],vbg[1],vbg[2]); doc.setDrawColor(vc[0],vc[1],vc[2]); doc.setLineWidth(0.4)
      doc.roundedRect(gx, gy, gridW, 24, 3, 3, "FD")
      doc.setTextColor(vc[0],vc[1],vc[2]); doc.setFontSize(14); doc.setFont("helvetica","bold")
      doc.text(String(item.value), gx+gridW/2, gy+10, {align:"center"})
      doc.setTextColor(200,210,220); doc.setFontSize(6.5); doc.setFont("helvetica","bold")
      doc.text(item.label, gx+gridW/2, gy+16, {align:"center"})
      const detLines = doc.splitTextToSize(item.detail, gridW-4)
      doc.setTextColor(100,116,139); doc.setFontSize(5.5); doc.setFont("helvetica","normal")
      doc.text(detLines[0]||"", gx+gridW/2, gy+21, {align:"center"})
    })
    y += Math.ceil(compItems.length/3)*32 + 6

    // ADA section
    y = addSectionTitle("ADA / WCAG 2.1 ACCESSIBILITY AUDIT", y, "#f97316")
    const adaScore = sec.accessibility_score || (mobileScore>=75?70:45)
    const adaRisk = adaScore < 50 ? "CRITICAL" : adaScore < 70 ? "HIGH RISK" : "MEDIUM RISK"
    const adaColor = adaScore < 50 ? "#ef4444" : adaScore < 70 ? "#f97316" : "#f59e0b"

    doc.setFillColor(28,5,5); doc.setDrawColor(127,29,29); doc.setLineWidth(0.3)
    doc.roundedRect(M, y, CW, 18, 3, 3, "FD")
    const adaC = hex(adaColor)
    doc.setTextColor(adaC[0],adaC[1],adaC[2]); doc.setFontSize(18); doc.setFont("helvetica","bold")
    doc.text(String(adaScore), M+12, y+12, {align:"center"})
    doc.setFontSize(7); doc.text("/100", M+20, y+12)
    doc.setFontSize(9); doc.text(adaRisk, M+32, y+8)
    doc.setTextColor(200,210,220); doc.setFontSize(7); doc.setFont("helvetica","normal")
    doc.text("ADA compliance failures expose US businesses to lawsuit risk.", M+32, y+14)
    y += 24

    // Legal risks
    if ((sec.legal_risks||[]).length > 0) {
      y = addSectionTitle("LEGAL RISKS IDENTIFIED", y, "#ef4444")
      ;(sec.legal_risks||[]).forEach((risk: string) => {
        const lines = doc.splitTextToSize(`! ${risk}`, CW-8)
        doc.setFillColor(28,5,5); doc.setDrawColor(127,29,29); doc.setLineWidth(0.3)
        doc.roundedRect(M, y, CW, lines.length*4.5+6, 2, 2, "FD")
        doc.setTextColor(252,165,165); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, M+4, y+5)
        y += lines.length*4.5+9
      })
    }

    // Security issues
    if ((sec.security_issues||[]).length > 0) {
      y = addSectionTitle("SECURITY ISSUES", y, "#f97316")
      ;(sec.security_issues||[]).forEach((issue: string) => {
        const lines = doc.splitTextToSize(`- ${issue}`, CW-8)
        doc.setFillColor(28,14,5); doc.setDrawColor(154,52,18); doc.setLineWidth(0.3)
        doc.roundedRect(M, y, CW, lines.length*4.5+6, 2, 2, "FD")
        doc.setTextColor(253,186,116); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, M+4, y+5)
        y += lines.length*4.5+9
      })
    }

    // Security recommendations
    if ((sec.recommendations||[]).length > 0) {
      y = addSectionTitle("REMEDIATION RECOMMENDATIONS", y, "#10b981")
      ;(sec.recommendations||[]).forEach((rec: string, i: number) => {
        const lines = doc.splitTextToSize(`${i+1}. ${rec}`, CW-8)
        doc.setFillColor(5,30,20); doc.setDrawColor(22,101,52); doc.setLineWidth(0.3)
        doc.roundedRect(M, y, CW, lines.length*4.5+6, 2, 2, "FD")
        doc.setTextColor(74,222,128); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, M+4, y+5)
        y += lines.length*4.5+9
      })
    }

    addFooter()

    // ═══════════════════════════════════════
    // PAGE 5 — 90-DAY ROADMAP
    // ═══════════════════════════════════════
    doc.addPage()
    addHeader(5, 5, "90-Day Action Roadmap")
    y = 22

    y = addSectionTitle("YOUR 90-DAY DIGITAL TRANSFORMATION PLAN", y, "#818cf8")

    // Phase blocks
    const phases = [
      {
        label:"WEEK 1 — QUICK WINS",
        subtitle:"No developer needed · Cost: " + (rm.week_1?.cost||"Free"),
        color:"#10b981", bg:"#052e16", border:"#166534",
        actions: rm.week_1?.actions||[],
        score: rm.week_1?.expected_score,
        icon:"⚡"
      },
      {
        label:"MONTH 1 — FOUNDATION",
        subtitle:"Basic developer needed · Cost: " + (rm.month_1?.cost||"£500-2,000"),
        color:"#f59e0b", bg:"#1c1505", border:"#92400e",
        actions: rm.month_1?.actions||[],
        score: rm.month_1?.expected_score,
        icon:"🏗"
      },
      {
        label:"MONTH 2-3 — GROWTH",
        subtitle:"Content & SEO investment · Cost: " + (rm.month_2_3?.cost||"£2,000-5,000"),
        color:"#818cf8", bg:"#0c1230", border:"#312e81",
        actions: rm.month_2_3?.actions||[],
        score: rm.month_2_3?.expected_score,
        icon:"🚀"
      }
    ]

    phases.forEach(phase => {
      if (!phase.actions.length) return
      const pc = hex(phase.color); const pb = hex(phase.bg); const pbr = hex(phase.border)
      // Phase header
      doc.setFillColor(pb[0],pb[1],pb[2]); doc.setDrawColor(pbr[0],pbr[1],pbr[2]); doc.setLineWidth(0.5)
      doc.roundedRect(M, y, CW, 12, 3, 3, "FD")
      doc.setTextColor(pc[0],pc[1],pc[2]); doc.setFontSize(9); doc.setFont("helvetica","bold")
      doc.text(phase.label, M+4, y+8)
      if (phase.score) {
        doc.setFillColor(pc[0],pc[1],pc[2]); doc.roundedRect(W-M-24, y+2, 22, 8, 2, 2, "F")
        doc.setTextColor(8,12,20); doc.setFontSize(7); doc.setFont("helvetica","bold")
        doc.text(`Target: ${phase.score}/100`, W-M-13, y+7.5, {align:"center"})
      }
      y += 14
      // Subtitle
      doc.setTextColor(100,116,139); doc.setFontSize(7); doc.setFont("helvetica","normal")
      doc.text(phase.subtitle, M, y)
      y += 6
      // Actions
      phase.actions.forEach((action: string, i: number) => {
        const lines = doc.splitTextToSize(`${i+1}. ${action}`, CW-12)
        const h = lines.length*4.5+6
        doc.setFillColor(pb[0],pb[1],pb[2]); doc.setDrawColor(pbr[0],pbr[1],pbr[2]); doc.setLineWidth(0.2)
        doc.roundedRect(M, y, CW, h, 2, 2, "FD")
        doc.setTextColor(210,220,235); doc.setFontSize(7.5); doc.setFont("helvetica","normal")
        doc.text(lines, M+4, y+5)
        y += h+3
      })
      y += 6
    })

    // Expected outcome
    if (rm.expected_outcome) {
      doc.setFillColor(5,46,22); doc.setDrawColor(16,185,129); doc.setLineWidth(0.4)
      const outLines = doc.splitTextToSize(`Expected Outcome After 90 Days: ${rm.expected_outcome}`, CW-8)
      doc.roundedRect(M, y, CW, outLines.length*5+10, 3, 3, "FD")
      doc.setTextColor(74,222,128); doc.setFontSize(8.5); doc.setFont("helvetica","bold")
      doc.setFont("helvetica","normal"); doc.setFontSize(8)
      doc.text(outLines, M+4, y+7)
      y += outLines.length*5+16
    }

    // Final CTA box
    doc.setFillColor(12,18,40); doc.setDrawColor(99,102,241); doc.setLineWidth(0.5)
    doc.roundedRect(M, y, CW, 28, 4, 4, "FD")
    doc.setTextColor(129,140,248); doc.setFontSize(11); doc.setFont("helvetica","bold")
    doc.text("Ready to implement this roadmap?", W/2, y+9, {align:"center"})
    doc.setTextColor(203,213,225); doc.setFontSize(8); doc.setFont("helvetica","normal")
    doc.text("Klaro Pulse monitors your site continuously and alerts you when competitors change strategy.", W/2, y+16, {align:"center"})
    doc.setTextColor(129,140,248); doc.setFontSize(8); doc.setFont("helvetica","bold")
    doc.text("klaro.services/pulse  ·  Monthly monitoring from $49/month", W/2, y+23, {align:"center"})

    addFooter()

    const filename = `klaro-pulse-${name.replace(/[^a-z0-9]/gi,"-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(filename)
  }


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
    const score = r.overall_score || r.authority_score || r.lam_score || 0
    const { data, error } = await supabase.from("pulse_reports").insert({
      log_id: log.id, target_url: log.url, target_name: name, score,
      report_html: generateReportHtml(log, r, name),
      is_public: false, created_by: user.id,
    }).select().single()
    if (!error && data) alert(`✅ Report saved!\nShare: klaro.services/pulse/report/${data.share_token}`)
    else if (error) alert(`Error: ${error.message}`)
  }

  function generateReportHtml(log: any, r: any, name: string) {
    const score = r.overall_score || r.authority_score || r.lam_score || 0
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

  function setSection(idx: number, section: string) {
    setActiveSection(prev => ({ ...prev, [idx]: prev[idx]===section?"":section }))
  }

  const filtered = logs
    .filter(l => filter==="all" || l.status===filter)
    .filter(l => !search || (l.metadata?.target_name||"").toLowerCase().includes(search.toLowerCase()) || (l.url||"").toLowerCase().includes(search.toLowerCase()))

  const scores = logs.map(l=>l.metadata?.full_report?.overall_score||l.metadata?.full_report?.authority_score||0).filter(s=>s>0)
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
                const score = r.overall_score||r.authority_score||0
                const isV2 = !!r.executive_brief
                const isOpen = expanded.has(idx)
                const curSection = activeSection[idx]||""
                const eb = r.executive_brief||{}
                const sec = r.security_compliance||{}
                const ux = r.ux_conversion_audit||{}
                const ci = r.competitive_intelligence||{}
                const rm = r.ninety_day_roadmap||{}
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
                          {isV2&&<span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">{r.report_type==='LAM'?'🤖 LAM':'v2'}</span>}
                          {isAdmin&&log.triggered_by_email&&<span className="text-xs text-amber-400/60">by {log.triggered_by_email}</span>}
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{eb.plain_english_summary||r.novice_summary||log.reasoning||"—"}</p>
                        {eb.one_line_verdict&&<p className="text-amber-400/80 text-xs mt-2 italic">"{eb.one_line_verdict}"</p>}
                        {ci.where_losing_clients&&<p className="text-red-400/70 text-xs mt-1">⚠ {ci.where_losing_clients}</p>}
                        {false&&<p className="text-amber-400/80 text-xs mt-2 italic">💡 {r.competitor_advantage}</p>}
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
                      {[["Overall",score],["Trust",r.ux_conversion_audit?.trust_score||r.trust_score||0],["Conversion",r.ux_conversion_audit?.conversion_score||r.conversion_score||0]].map(([l,v])=>(
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
                      <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mb-2">Compliance & Security</div>
                      <div className="grid grid-cols-5 gap-2">
                        {[["HTTPS",httpsScore],["Mobile",mobileScore],["Cookie",sec.cookie_consent?90:20],["Privacy",sec.privacy_policy?90:20],["SOC2",sec.soc2_readiness==="Ready"?90:sec.soc2_readiness==="Partial"?60:30]].map(([l,v])=>(
                          <div key={l as string} className="bg-[#080c14] border border-slate-800 rounded-lg p-2 text-center">
                            <div className="text-sm font-black" style={{color:sc(v as number)}}>{v}</div>
                            <div className="text-xs text-slate-600 font-semibold mt-0.5">{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* V2 Section Tabs */}
                    {isV2&&(
                      <div className="px-5 py-2 flex gap-2 border-b border-slate-800/40 flex-wrap">
                        {[["actions","Top Actions"],["competitive","Competitive"],["issues","UX Issues"],["security","Security"],["roadmap","90-Day Plan"]].map(([s,l])=>(
                          <button key={s} onClick={()=>setActiveSection(prev=>({...prev,[idx]:prev[idx]===s?"":s}))}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${curSection===s?"bg-indigo-500/10 text-indigo-400 border-indigo-500/30":"border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    )}

                    {isV2&&curSection==="actions"&&(
                      <div className="px-5 py-4 border-b border-slate-800/40 space-y-2">
                        {(eb.top_3_actions||[]).map((action:string,i:number)=>(
                          <div key={i} className={`p-3 rounded-xl border text-sm ${i===0?"bg-green-500/5 border-green-500/20 text-green-300":i===1?"bg-yellow-500/5 border-yellow-500/20 text-yellow-300":"bg-blue-500/5 border-blue-500/20 text-blue-300"}`}>
                            <span className={`text-xs font-black mr-2 ${i===0?"text-green-400":i===1?"text-yellow-400":"text-blue-400"}`}>{["THIS WEEK","THIS MONTH","THIS QUARTER"][i]}</span>
                            {action}
                          </div>
                        ))}
                        {eb.estimated_revenue_impact&&<div className="text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2">💰 {eb.estimated_revenue_impact}</div>}
                      </div>
                    )}

                    {isV2&&curSection==="competitive"&&(
                      <div className="px-5 py-4 border-b border-slate-800/40 space-y-3">
                        {ci.market_position&&<div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3"><div className="text-xs font-bold text-indigo-400 mb-1">Market Position</div><div className="text-sm text-slate-300">{ci.market_position}</div></div>}
                        {ci.where_losing_clients&&<div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3"><div className="text-xs font-bold text-red-400 mb-1">Why clients choose competitors</div><div className="text-sm text-slate-300">{ci.where_losing_clients}</div></div>}
                        {ci.biggest_competitor_advantage&&<div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3"><div className="text-xs font-bold text-orange-400 mb-1">Biggest competitor advantage</div><div className="text-sm text-slate-300">{ci.biggest_competitor_advantage}</div></div>}
                        {ci.opportunity_to_win&&<div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3"><div className="text-xs font-bold text-green-400 mb-1">Your opportunity to win</div><div className="text-sm text-slate-300">{ci.opportunity_to_win}</div></div>}
                        {(r.competitors_scanned||[]).length>0&&<div className="text-xs text-slate-600 pt-1">Scanned against: {r.competitors_scanned.join(", ")}</div>}
                      </div>
                    )}

                    {isV2&&curSection==="issues"&&(
                      <div className="px-5 py-4 border-b border-slate-800/40 space-y-2">
                        {(ux.issues||[]).slice(0,5).map((issue:any,i:number)=>(
                          <div key={i} className={`p-3 rounded-xl border ${issue.priority==="Critical"?"bg-red-500/5 border-red-500/20":issue.priority==="High"?"bg-orange-500/5 border-orange-500/20":"bg-slate-800/30 border-slate-700"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <span className={`text-xs font-black mr-2 ${issue.priority==="Critical"?"text-red-400":issue.priority==="High"?"text-orange-400":"text-slate-400"}`}>{issue.priority}</span>
                                <span className="text-sm text-white font-semibold">{issue.issue}</span>
                                {issue.business_impact&&<div className="text-xs text-slate-400 mt-1">{issue.business_impact}</div>}
                                {issue.fix&&<div className="text-xs text-green-400 mt-1">Fix: {issue.fix}</div>}
                              </div>
                              <div className="text-right flex-shrink-0 text-xs text-slate-600">
                                {issue.effort&&<div>{issue.effort}</div>}
                                {issue.cost&&<div>{issue.cost}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(ux.quick_wins||[]).length>0&&<div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3"><div className="text-xs font-bold text-green-400 mb-2">Quick Wins — Free, Under 1 Hour</div>{(ux.quick_wins||[]).map((w:string,i:number)=><div key={i} className="text-xs text-slate-300 mb-1">• {w}</div>)}</div>}
                      </div>
                    )}

                    {isV2&&curSection==="security"&&(
                      <div className="px-5 py-4 border-b border-slate-800/40 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[["HTTPS",sec.https],["Cookie Consent",sec.cookie_consent],["Privacy Policy",sec.privacy_policy],["SOC2 Ready",sec.soc2_readiness==="Ready"],["GDPR Compliant",sec.gdpr_compliance==="Compliant"]].map(([l,v])=>(
                            <div key={l as string} className={`p-2.5 rounded-xl border text-xs font-bold ${v?"bg-green-500/5 border-green-500/20 text-green-400":"bg-red-500/5 border-red-500/20 text-red-400"}`}>
                              {v?"✓":"✗"} {l as string}
                            </div>
                          ))}
                        </div>
                        {(sec.legal_risks||[]).length>0&&<div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3"><div className="text-xs font-bold text-red-400 mb-2">Legal Risks</div>{(sec.legal_risks||[]).map((r:string,i:number)=><div key={i} className="text-xs text-slate-300 mb-1">⚠ {r}</div>)}</div>}
                        {(sec.security_issues||[]).length>0&&<div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3"><div className="text-xs font-bold text-orange-400 mb-2">Security Issues</div>{(sec.security_issues||[]).map((r:string,i:number)=><div key={i} className="text-xs text-slate-300 mb-1">• {r}</div>)}</div>}
                        {(sec.recommendations||[]).length>0&&<div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3"><div className="text-xs font-bold text-indigo-400 mb-2">Recommendations</div>{(sec.recommendations||[]).map((r:string,i:number)=><div key={i} className="text-xs text-slate-300 mb-1">→ {r}</div>)}</div>}
                      </div>
                    )}

                    {isV2&&curSection==="roadmap"&&(
                      <div className="px-5 py-4 border-b border-slate-800/40">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {[{label:"Week 1",data:rm.week_1,color:"text-green-400",border:"border-green-500/20",bg:"bg-green-500/5"},{label:"Month 1",data:rm.month_1,color:"text-yellow-400",border:"border-yellow-500/20",bg:"bg-yellow-500/5"},{label:"Month 2-3",data:rm.month_2_3,color:"text-blue-400",border:"border-blue-500/20",bg:"bg-blue-500/5"}].map(ph=>(
                            <div key={ph.label} className={`${ph.bg} border ${ph.border} rounded-xl p-3`}>
                              <div className={`text-xs font-black ${ph.color} mb-1`}>{ph.label}</div>
                              {ph.data?.expected_score&&<div className="text-xs text-slate-500 mb-2">Target: {ph.data.expected_score}/100</div>}
                              {(ph.data?.actions||[]).map((a:string,i:number)=><div key={i} className="text-xs text-slate-300 mb-1.5">• {a}</div>)}
                              {ph.data?.cost&&<div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/50">{ph.data.cost}</div>}
                            </div>
                          ))}
                        </div>
                        {rm.expected_outcome&&<div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-sm text-green-300">🎯 {rm.expected_outcome}</div>}
                      </div>
                    )}

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
                      <button onClick={()=>downloadPDF(log)} className="text-xs text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20">
                        ⬇ Download PDF
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
