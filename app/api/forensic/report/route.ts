import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { engagement, findings, transactions, bsIssues, taxChecks, tallyEntries, interviews, amlChecks } = await req.json()

  const totalImpact = (findings || []).reduce((s: number, f: any) => s + Number(f.financial_impact || 0), 0)
  const criticalFindings = (findings || []).filter((f: any) => f.severity === "critical")
  const flaggedTxns = (transactions || []).filter((t: any) => t.is_flagged)
  const deletedEntries = (tallyEntries || []).filter((t: any) => t.finding_type === "tally_entry_deleted")
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  // --- AI executive summary via Groq ---
  let aiSummary = ""
  let aiObservations: string[] = []
  let aiRecommendations: string[] = []
  const GROQ_KEY = process.env.GROQ_API_KEY
  if (GROQ_KEY) {
    try {
      const prompt = `You are a senior forensic auditor preparing a professional report. Based on this engagement data, write:
1. "executive_summary": A 3-4 sentence factual executive summary (formal, legally defensible, third-person)
2. "key_observations": An array of 5-8 specific observations from the data
3. "recommendations": An array of 5-8 actionable recommendations

Engagement: ${JSON.stringify({ engagement, findingsCount: findings?.length, criticalCount: criticalFindings.length, bsIssuesCount: bsIssues?.length, taxChecksCount: taxChecks?.length, tallyDeletedCount: deletedEntries.length, flaggedTxnsCount: flaggedTxns.length, totalImpact, topFindings: (findings || []).slice(0, 5).map((f: any) => ({ title: f.title, severity: f.severity, type: f.finding_type, impact: f.financial_impact })) })}

Respond in valid JSON only.`

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a world-class forensic auditor. Respond in valid JSON only, no markdown, no backticks." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1200,
        })
      })
      const result = await res.json()
      const text = result.choices?.[0]?.message?.content || "{}"
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      aiSummary = parsed.executive_summary || ""
      aiObservations = Array.isArray(parsed.key_observations) ? parsed.key_observations : []
      aiRecommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    } catch (e) {
      aiSummary = ""
    }
  }

  const riskColor = (s: string) => s === "critical" ? "#dc2626" : s === "high" ? "#ea580c" : s === "medium" ? "#d97706" : "#16a34a"
  const riskBg = (s: string) => s === "critical" ? "#fef2f2" : s === "high" ? "#fff7ed" : s === "medium" ? "#fffbeb" : "#f0fdf4"

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Forensic Audit Report — ${engagement?.client_name || "Client"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #1a1a1a; background: white; }
  @page { margin: 2.5cm 2cm; size: A4; }
  .page-break { page-break-after: always; }

  .cover { text-align: center; padding: 60px 40px; border: 3px double #1a1a1a; margin: 20px; min-height: 90vh; display: flex; flex-direction: column; justify-content: center; gap: 0; }
  .cover-logo { font-size: 9pt; letter-spacing: 4px; text-transform: uppercase; color: #888; margin-bottom: 48px; }
  .cover-type { font-size: 9pt; letter-spacing: 3px; text-transform: uppercase; color: #666; margin-bottom: 12px; }
  .cover-title { font-size: 28pt; font-weight: bold; margin-bottom: 8px; line-height: 1.2; }
  .cover-client { font-size: 17pt; margin-bottom: 48px; color: #333; font-style: italic; }
  .cover-hr { border: none; border-top: 2px solid #1a1a1a; width: 80px; margin: 0 auto 48px; }
  .cover-meta { font-size: 10.5pt; line-height: 2.2; color: #444; }
  .cover-confidential { margin-top: 48px; font-size: 8pt; letter-spacing: 2px; text-transform: uppercase; color: #999; border: 1px solid #ccc; display: inline-block; padding: 5px 16px; }

  h1 { font-size: 13pt; font-weight: bold; margin: 28px 0 12px; border-bottom: 2px solid #1a1a1a; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; }
  h2 { font-size: 11.5pt; font-weight: bold; margin: 20px 0 10px; }
  p { margin-bottom: 9px; line-height: 1.65; }

  .section { margin-bottom: 36px; }
  .info-grid { display: grid; grid-template-columns: 200px 1fr; border: 1px solid #ccc; margin-bottom: 16px; }
  .info-label { padding: 7px 12px; background: #f5f5f5; font-weight: bold; font-size: 9.5pt; border-bottom: 1px solid #ddd; }
  .info-value { padding: 7px 12px; font-size: 9.5pt; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd; }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
  .kpi-box { border: 1px solid #ddd; padding: 14px 10px; text-align: center; }
  .kpi-value { font-size: 22pt; font-weight: bold; }
  .kpi-label { font-size: 8.5pt; color: #666; margin-top: 4px; }

  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9.5pt; }
  th { background: #1c1c1c; color: white; padding: 7px 10px; text-align: left; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 6px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:nth-child(even) td { background: #fafafa; }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 8pt; font-weight: bold; }
  .finding-card { border: 1px solid #e5e5e5; margin: 12px 0; padding: 14px 16px; border-left: 4px solid #dc2626; }
  .finding-card.high { border-left-color: #ea580c; }
  .finding-card.medium { border-left-color: #d97706; }
  .finding-card.low { border-left-color: #16a34a; }
  .finding-title { font-weight: bold; font-size: 10.5pt; margin-bottom: 5px; }
  .finding-meta { font-size: 8.5pt; color: #666; margin-bottom: 7px; }
  .finding-desc { font-size: 9.5pt; line-height: 1.6; margin-bottom: 7px; }
  .finding-rec { font-size: 9.5pt; font-style: italic; color: #444; padding: 7px 12px; background: #f8f8f8; border-left: 3px solid #bbb; }

  .alert-box { padding: 12px 16px; margin: 12px 0; border-left: 4px solid; border-radius: 2px; }
  .alert-red { background: #fef2f2; border-color: #dc2626; }
  .alert-amber { background: #fffbeb; border-color: #d97706; }
  .alert-green { background: #f0fdf4; border-color: #16a34a; }
  .alert-blue { background: #eff6ff; border-color: #2563eb; }

  .obs-list { list-style: none; padding: 0; }
  .obs-list li { padding: 6px 0 6px 20px; border-bottom: 1px solid #f0f0f0; font-size: 9.5pt; line-height: 1.5; position: relative; }
  .obs-list li:before { content: "▸"; position: absolute; left: 0; color: #666; }

  .rec-list { counter-reset: rec; list-style: none; padding: 0; }
  .rec-list li { counter-increment: rec; padding: 7px 0 7px 28px; border-bottom: 1px solid #f0f0f0; font-size: 9.5pt; line-height: 1.5; position: relative; }
  .rec-list li:before { content: counter(rec) "."; position: absolute; left: 0; font-weight: bold; color: #1a1a1a; }

  .sig-block { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 60px; }
  .sig-line { border-top: 1px solid #1a1a1a; padding-top: 8px; margin-top: 50px; font-size: 9.5pt; line-height: 1.8; }

  .toc { list-style: none; padding: 0; }
  .toc li { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; font-size: 10.5pt; }

  .footer { text-align: center; font-size: 8pt; color: #aaa; margin-top: 48px; padding-top: 12px; border-top: 1px solid #eee; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover page-break">
  <div class="cover-logo">klaro.services — India CA Suite · Forensic Audit Module</div>
  <div class="cover-type">Confidential Report</div>
  <div class="cover-title">FORENSIC AUDIT<br>REPORT</div>
  <div class="cover-client">${engagement?.client_name || "Client Name"}</div>
  <hr class="cover-hr">
  <div class="cover-meta">
    <div><strong>Engagement No.</strong> &nbsp; ${engagement?.engagement_no || "—"}</div>
    <div><strong>Audit Period</strong> &nbsp; ${engagement?.period_from || "—"} &nbsp;to&nbsp; ${engagement?.period_to || "—"}</div>
    <div><strong>Standard</strong> &nbsp; ${engagement?.standard || "ICAI SA 240"}</div>
    <div><strong>Lead Investigator</strong> &nbsp; ${engagement?.lead_investigator || "—"}</div>
    <div><strong>Country</strong> &nbsp; ${engagement?.country || "India"}</div>
    <div><strong>Report Date</strong> &nbsp; ${today}</div>
    <div><strong>Risk Rating</strong> &nbsp; <strong style="color:${riskColor(engagement?.risk_rating||"medium")}">${(engagement?.risk_rating || "—").toUpperCase()}</strong></div>
  </div>
  <div class="cover-confidential">Privileged &amp; Confidential — Not for Distribution</div>
</div>

<!-- TOC -->
<div class="section page-break">
  <h1>Table of Contents</h1>
  <ul class="toc">
    ${[["1","Executive Summary"],["2","Engagement Details"],["3","Key Findings Summary"],["4","Balance Sheet Issues"],["5","Tax Compliance Gaps — GST / TDS / Advance Tax"],["6","Tally Entry Audit — Changed & Deleted Entries"],["7","Transaction Analysis & Anomalies"],["8","AML / KYC Screening"],["9","Detailed Findings Register"],["10","Recommendations"],["11","Conclusion & Disclaimer"]].map(([n,t])=>`<li><span>${n}. &nbsp; ${t}</span><span style="color:#ccc">— — —</span></li>`).join("")}
  </ul>
</div>

<!-- 1. EXECUTIVE SUMMARY -->
<div class="section">
  <h1>1. Executive Summary</h1>
  ${criticalFindings.length > 0 ? `<div class="alert-box alert-red"><strong>⚠ ${criticalFindings.length} Critical Finding(s) Identified</strong><br><span style="font-size:9.5pt">${criticalFindings.map((f:any)=>f.title).join(" · ")}</span></div>` : ""}
  <p>${aiSummary || `This Forensic Audit Report has been prepared in connection with Engagement <strong>${engagement?.engagement_no||"—"}</strong> for <strong>${engagement?.client_name||"the entity"}</strong> covering the period from <strong>${engagement?.period_from||"—"}</strong> to <strong>${engagement?.period_to||"—"}</strong>. The audit was conducted in accordance with <strong>${engagement?.standard||"ICAI SA 240"}</strong> and applicable ACFE and FATF guidelines. ${totalImpact>0?`The aggregate estimated financial impact of all identified findings is <strong>₹${totalImpact.toLocaleString("en-IN")}</strong>.`:"No material financial impact was quantified at this stage."} Management attention is required on all critical and high severity findings documented herein.`}</p>
  <div class="kpi-grid">
    <div class="kpi-box" style="background:${criticalFindings.length>0?"#fef2f2":"#fafafa"}"><div class="kpi-value" style="color:${criticalFindings.length>0?"#dc2626":"#1a1a1a"}">${(findings||[]).length}</div><div class="kpi-label">Total Findings</div></div>
    <div class="kpi-box" style="background:#fef2f2"><div class="kpi-value" style="color:#dc2626">${criticalFindings.length}</div><div class="kpi-label">Critical</div></div>
    <div class="kpi-box"><div class="kpi-value">₹${totalImpact>=100000?(totalImpact/100000).toFixed(1)+"L":totalImpact.toLocaleString("en-IN")}</div><div class="kpi-label">Financial Impact</div></div>
    <div class="kpi-box" style="background:${flaggedTxns.length>0?"#fff7ed":"#fafafa"}"><div class="kpi-value" style="color:${flaggedTxns.length>0?"#ea580c":"#1a1a1a"}">${flaggedTxns.length}</div><div class="kpi-label">Flagged Transactions</div></div>
    <div class="kpi-box"><div class="kpi-value">${(bsIssues||[]).length}</div><div class="kpi-label">BS Issues</div></div>
    <div class="kpi-box"><div class="kpi-value">${(taxChecks||[]).length}</div><div class="kpi-label">Tax Gaps</div></div>
    <div class="kpi-box" style="background:${deletedEntries.length>0?"#fef2f2":"#fafafa"}"><div class="kpi-value" style="color:${deletedEntries.length>0?"#dc2626":"#1a1a1a"}">${deletedEntries.length}</div><div class="kpi-label">Tally Deletions</div></div>
    <div class="kpi-box"><div class="kpi-value">${(amlChecks||[]).filter((a:any)=>a.pep_check==="match_found"||a.sanctions_check==="match_found").length}</div><div class="kpi-label">AML Matches</div></div>
  </div>
  ${aiObservations.length>0?`<h2>Key Observations</h2><ul class="obs-list">${aiObservations.map((o:string)=>`<li>${o}</li>`).join("")}</ul>`:""}
</div>

<!-- 2. ENGAGEMENT DETAILS -->
<div class="section">
  <h1>2. Engagement Details</h1>
  <div class="info-grid">
    <div class="info-label">Engagement Number</div><div class="info-value">${engagement?.engagement_no||"—"}</div>
    <div class="info-label">Client / Entity</div><div class="info-value"><strong>${engagement?.client_name||"—"}</strong></div>
    <div class="info-label">Engagement Type</div><div class="info-value">${engagement?.engagement_type?.replace(/_/g," ")||"—"}</div>
    <div class="info-label">Country</div><div class="info-value">${engagement?.country||"India"}</div>
    <div class="info-label">Currency</div><div class="info-value">${engagement?.currency||"INR"}</div>
    <div class="info-label">Audit Period</div><div class="info-value">${engagement?.period_from||"—"} to ${engagement?.period_to||"—"}</div>
    <div class="info-label">Lead Investigator</div><div class="info-value">${engagement?.lead_investigator||"—"}</div>
    <div class="info-label">Standard Applied</div><div class="info-value">${engagement?.standard||"ICAI SA 240"}</div>
    <div class="info-label">Risk Rating</div><div class="info-value"><strong style="color:${riskColor(engagement?.risk_rating||"medium")}">${(engagement?.risk_rating||"—").toUpperCase()}</strong></div>
    <div class="info-label">Status</div><div class="info-value">${engagement?.status||"—"}</div>
    <div class="info-label">Report Date</div><div class="info-value">${today}</div>
    <div class="info-label">Scope</div><div class="info-value">${engagement?.scope||"Full forensic examination of books of accounts, supporting records, and financial data for the stated period."}</div>
  </div>
</div>

<!-- 3. FINDINGS SUMMARY -->
<div class="section">
  <h1>3. Key Findings Summary</h1>
  ${(findings||[]).length===0?`<div class="alert-box alert-green"><strong>✓ No findings recorded</strong> for this engagement.</div>`:`
  <table>
    <thead><tr><th>Ref</th><th>Title</th><th>Type</th><th>Severity</th><th>Financial Impact</th><th>Status</th></tr></thead>
    <tbody>${(findings||[]).map((f:any)=>`<tr><td style="font-family:monospace;font-weight:bold;color:#dc2626;font-size:8.5pt">${f.finding_no||"—"}</td><td><strong style="font-size:9.5pt">${f.title}</strong></td><td style="font-size:9pt;color:#555">${f.finding_type?.replace(/_/g," ")||"—"}</td><td><span class="badge" style="background:${riskBg(f.severity)};color:${riskColor(f.severity)}">${f.severity}</span></td><td style="font-family:monospace;font-weight:bold;font-size:9.5pt">${f.financial_impact?"₹"+Number(f.financial_impact).toLocaleString("en-IN"):"—"}</td><td style="font-size:9pt">${f.status||"open"}</td></tr>`).join("")}</tbody>
  </table>`}
</div>

<!-- 4. BALANCE SHEET -->
<div class="section">
  <h1>4. Balance Sheet Issues</h1>
  ${(bsIssues||[]).length===0?`<div class="alert-box alert-green"><strong>✓ No balance sheet issues identified</strong> in the period under review.</div>`:`
  <table>
    <thead><tr><th>BS Head</th><th>Issue Type</th><th>Financial Impact</th><th>Severity</th><th>Recommendation</th></tr></thead>
    <tbody>${(bsIssues||[]).map((f:any)=>`<tr><td><strong>${f.title?.split(" — ")[1]||f.title}</strong></td><td style="font-size:9pt">${f.finding_type?.replace(/_/g," ")||"—"}</td><td style="font-family:monospace;font-weight:bold;color:#dc2626">${f.financial_impact?"₹"+Number(f.financial_impact).toLocaleString("en-IN"):"—"}</td><td><span class="badge" style="background:${riskBg(f.severity)};color:${riskColor(f.severity)}">${f.severity}</span></td><td style="font-size:9pt">${f.recommendation||"—"}</td></tr>`).join("")}</tbody>
  </table>
  <p style="font-size:9.5pt;color:#555">Aggregate balance sheet impact: <strong>₹${(bsIssues||[]).reduce((s:number,f:any)=>s+Number(f.financial_impact||0),0).toLocaleString("en-IN")}</strong></p>`}
</div>

<!-- 5. TAX COMPLIANCE -->
<div class="section">
  <h1>5. Tax Compliance Gaps — GST / TDS / Advance Tax</h1>
  ${(taxChecks||[]).length===0?`<div class="alert-box alert-green"><strong>✓ No tax compliance gaps identified.</strong></div>`:`
  <table>
    <thead><tr><th>Check Type</th><th>Period</th><th>Tax Gap</th><th>Severity</th><th>Recommendation</th></tr></thead>
    <tbody>${(taxChecks||[]).map((f:any)=>`<tr><td><strong style="font-size:9.5pt">${f.finding_type?.replace(/_/g," ")||"—"}</strong></td><td style="font-size:9pt">${f.title?.split(" — ")[1]||"—"}</td><td style="font-family:monospace;font-weight:bold;color:#dc2626">${f.financial_impact?"₹"+Number(f.financial_impact).toLocaleString("en-IN"):"—"}</td><td><span class="badge" style="background:${riskBg(f.severity)};color:${riskColor(f.severity)}">${f.severity}</span></td><td style="font-size:9pt">${f.recommendation||"—"}</td></tr>`).join("")}</tbody>
  </table>
  <p style="font-size:9.5pt;color:#555">Total estimated tax exposure: <strong>₹${(taxChecks||[]).reduce((s:number,t:any)=>s+Number(t.financial_impact||0),0).toLocaleString("en-IN")}</strong></p>`}
</div>

<!-- 6. TALLY RECON -->
<div class="section">
  <h1>6. Tally Entry Audit — Changed &amp; Deleted Entries</h1>
  ${(tallyEntries||[]).length===0?`<div class="alert-box alert-green"><strong>✓ No Tally entry modifications or deletions identified.</strong></div>`:`
  <div class="alert-box ${deletedEntries.length>0?"alert-red":"alert-amber'}"}">
    <strong>${deletedEntries.length>0?`⚠ ${deletedEntries.length} voucher(s) deleted from Tally`:"Tally modifications detected"}</strong> — management explanation required for all entries below.
  </div>
  <table>
    <thead><tr><th>Change Type</th><th>Voucher No.</th><th>Ledger / Account</th><th>Financial Impact</th><th>Changed By</th></tr></thead>
    <tbody>${(tallyEntries||[]).map((f:any)=>`<tr style="${f.finding_type==="tally_entry_deleted"?"background:#fff8f8":""}"><td><span class="badge" style="background:${f.finding_type==="tally_entry_deleted"?"#fef2f2":"#fffbeb"};color:${f.finding_type==="tally_entry_deleted"?"#dc2626":"#d97706"}">${f.finding_type==="tally_entry_deleted"?"DELETED":"MODIFIED"}</span></td><td style="font-family:monospace;font-size:9pt">${f.title?.split(" — ")[1]||"—"}</td><td style="font-size:9pt">${f.description?.split("Ledger: ")[1]?.split(".")[0]||"—"}</td><td style="font-family:monospace;font-weight:bold;color:#dc2626">${f.financial_impact?"₹"+Number(f.financial_impact).toLocaleString("en-IN"):"—"}</td><td style="font-size:9pt">${f.description?.split("Changed by: ")[1]?.split(" on")[0]||"—"}</td></tr>`).join("")}</tbody>
  </table>`}
</div>

<!-- 7. TRANSACTIONS -->
<div class="section">
  <h1>7. Transaction Analysis &amp; Anomalies</h1>
  <div class="info-grid">
    <div class="info-label">Total transactions reviewed</div><div class="info-value">${(transactions||[]).length}</div>
    <div class="info-label">Flagged transactions</div><div class="info-value" style="color:${flaggedTxns.length>0?"#dc2626":"inherit"};font-weight:${flaggedTxns.length>0?"bold":"normal"}">${flaggedTxns.length}</div>
    <div class="info-label">High-value (≥ ₹5,00,000)</div><div class="info-value">${(transactions||[]).filter((t:any)=>Number(t.amount)>=500000).length}</div>
    <div class="info-label">Round-number amounts</div><div class="info-value">${(transactions||[]).filter((t:any)=>Number(t.amount)%100000===0&&Number(t.amount)>0).length}</div>
  </div>
  ${flaggedTxns.length>0?`
  <h2>Flagged Transactions</h2>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Party</th><th>Amount</th><th>Flag</th><th>Severity</th></tr></thead>
    <tbody>${flaggedTxns.slice(0,25).map((t:any)=>`<tr><td style="font-size:9pt">${t.transaction_date||"—"}</td><td style="font-size:9pt;max-width:180px">${t.description||"—"}</td><td style="font-size:9pt">${t.party_to||t.party_from||"—"}</td><td style="font-family:monospace;font-weight:bold">₹${Number(t.amount||0).toLocaleString("en-IN")}</td><td style="font-size:9pt">${t.flag_type?.replace(/_/g," ")||"—"}</td><td><span class="badge" style="background:${riskBg(t.flag_severity)};color:${riskColor(t.flag_severity)}">${t.flag_severity}</span></td></tr>`).join("")}</tbody>
  </table>`:
  `<div class="alert-box alert-green"><strong>✓ No transactions flagged</strong> for suspicious patterns.</div>`}
</div>

<!-- 8. AML -->
<div class="section">
  <h1>8. AML / KYC Screening Results</h1>
  ${(amlChecks||[]).length===0?`<p style="color:#666">No AML/KYC screenings recorded for this engagement.</p>`:`
  <table>
    <thead><tr><th>Entity</th><th>Type</th><th>ID</th><th>PEP</th><th>Sanctions</th><th>Adverse Media</th><th>Screened By</th></tr></thead>
    <tbody>${(amlChecks||[]).map((a:any)=>{
      const cb=(v:string)=>v==="match_found"?`<span style="color:#dc2626;font-weight:bold">⚠ Match</span>`:v==="clear"?`<span style="color:#16a34a">✓ Clear</span>`:`<span style="color:#999">Not checked</span>`
      return`<tr><td><strong>${a.entity_name}</strong></td><td style="font-size:9pt">${a.entity_type}</td><td style="font-family:monospace;font-size:9pt">${a.id_number?a.id_type?.toUpperCase()+": "+a.id_number:"—"}</td><td>${cb(a.pep_check)}</td><td>${cb(a.sanctions_check)}</td><td>${cb(a.adverse_media)}</td><td style="font-size:9pt">${a.checked_by||"—"}</td></tr>`}).join("")}</tbody>
  </table>`}
</div>

<!-- 9. DETAILED FINDINGS -->
<div class="section page-break">
  <h1>9. Detailed Findings Register</h1>
  ${(findings||[]).length===0?`<div class="alert-box alert-green"><strong>✓ No findings recorded.</strong></div>`:
  (findings||[]).map((f:any)=>`
  <div class="finding-card ${f.severity}">
    <div class="finding-title">${f.finding_no?f.finding_no+" — ":""}${f.title}</div>
    <div class="finding-meta">Type: ${f.finding_type?.replace(/_/g," ")||"—"} &nbsp;|&nbsp; Severity: <span style="color:${riskColor(f.severity)};font-weight:bold">${(f.severity||"").toUpperCase()}</span> &nbsp;|&nbsp; Impact: ${f.financial_impact?"₹"+Number(f.financial_impact).toLocaleString("en-IN"):"—"} &nbsp;|&nbsp; Status: ${f.status||"open"}</div>
    <div class="finding-desc">${f.description||"No description provided."}</div>
    ${f.recommendation?`<div class="finding-rec"><strong>Recommendation:</strong> ${f.recommendation}</div>`:""}
  </div>`).join("")}
</div>

<!-- 10. RECOMMENDATIONS -->
<div class="section">
  <h1>10. Recommendations</h1>
  ${aiRecommendations.length>0?`<ul class="rec-list">${aiRecommendations.map((r:string)=>`<li>${r}</li>`).join("")}</ul>`
  :(findings||[]).filter((f:any)=>f.recommendation).length>0?`
  <table>
    <thead><tr><th>#</th><th>Finding</th><th>Recommendation</th><th>Priority</th></tr></thead>
    <tbody>${(findings||[]).filter((f:any)=>f.recommendation).map((f:any,i:number)=>`<tr><td style="font-weight:bold;color:#666">${i+1}</td><td><strong>${f.title}</strong></td><td>${f.recommendation}</td><td><span class="badge" style="background:${riskBg(f.severity)};color:${riskColor(f.severity)}">${f.severity}</span></td></tr>`).join("")}</tbody>
  </table>`:`<p>No specific recommendations recorded.</p>`}
</div>

<!-- 11. CONCLUSION -->
<div class="section">
  <h1>11. Conclusion &amp; Disclaimer</h1>
  <p>This report has been prepared based on the information and records made available during Engagement <strong>${engagement?.engagement_no||"—"}</strong>. Our procedures were performed in accordance with <strong>${engagement?.standard||"ICAI SA 240"}</strong>, applicable ACFE methodology, and relevant FATF recommendations.</p>
  <p>The findings, conclusions, and recommendations contained herein are based solely on the evidence examined during the engagement period and should be read in conjunction with the supporting working papers maintained separately by the engagement team.</p>
  ${totalImpact>0?`<p>The aggregate estimated financial impact of all identified findings is <strong>₹${totalImpact.toLocaleString("en-IN")}</strong>. This estimate is subject to management's review and independent verification.</p>`:""}
  <p>This report is <strong>privileged and confidential</strong>. It has been prepared solely for the addressee and must not be disclosed to any third party without prior written consent of the issuing firm.</p>
  <div class="sig-block">
    <div>
      <div class="sig-line">
        <div><strong>Lead Investigator</strong></div>
        <div style="color:#666;margin-top:2px">${engagement?.lead_investigator||"_________________________"}</div>
        <div style="color:#666">Date: ${today}</div>
      </div>
    </div>
    <div>
      <div class="sig-line">
        <div><strong>Authorised Signatory</strong></div>
        <div style="color:#999;margin-top:2px">_________________________</div>
        <div style="color:#999">Date: _________________________</div>
      </div>
    </div>
  </div>
</div>

<div class="footer">
  klaro.services India CA Suite — Forensic Audit Module &nbsp;·&nbsp; ${today} &nbsp;·&nbsp; ${engagement?.engagement_no||""} &nbsp;·&nbsp; Privileged &amp; Confidential
</div>
</body>
</html>`

  return NextResponse.json({ html })
}
