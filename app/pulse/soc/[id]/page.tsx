'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

function sc(s: number) { return s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : s >= 40 ? '#ea580c' : '#dc2626' }
function scBg(s: number) { return s >= 80 ? '#f0fdf4' : s >= 60 ? '#fffbeb' : s >= 40 ? '#fff7ed' : '#fef2f2' }
function scBorder(s: number) { return s >= 80 ? '#bbf7d0' : s >= 60 ? '#fde68a' : s >= 40 ? '#fed7aa' : '#fecaca' }
function readinessColor(level: string) {
  if (level === 'SOC 2 Ready') return '#16a34a'
  if (level === 'Partially Ready') return '#d97706'
  if (level === 'Needs Work') return '#ea580c'
  return '#dc2626'
}

function ScoreBox({ label, val, sub }: { label: string; val: number; sub?: string }) {
  return (
    <div style={{ background: scBg(val), border: `2px solid ${scBorder(val)}`, borderRadius: '10px', padding: '14px', textAlign: 'center' as const }}>
      <div style={{ fontSize: '26px', fontWeight: 900, color: sc(val), lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginTop: '4px', fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
      <span style={{ color: ok ? '#16a34a' : '#dc2626', fontWeight: 700, minWidth: '16px' }}>{ok ? '✓' : '✗'}</span>
      <span style={{ color: ok ? '#374151' : '#6b7280' }}>{label}</span>
    </div>
  )
}

function Gap({ gap }: { gap: any }) {
  const sev = gap.severity
  const colors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    Critical: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#dc2626' },
    High: { bg: '#fff7ed', border: '#fed7aa', text: '#92400e', dot: '#ea580c' },
    Medium: { bg: '#fffbeb', border: '#fde68a', text: '#78350f', dot: '#d97706' },
    Low: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', dot: '#2563eb' },
  }
  const c = colors[sev] || colors.Low
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.dot}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{gap.control}</div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: c.dot, background: 'white', border: `1px solid ${c.border}`, borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap' as const, marginLeft: '8px' }}>{sev}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#7c3aed', marginBottom: '4px', fontWeight: 500 }}>{gap.criterion}</div>
      <div style={{ fontSize: '11px', color: c.text, marginBottom: '6px' }}>🔧 {gap.fix}</div>
      <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#9ca3af' }}>
        <span>⏱ {gap.effort}</span>
        <span>💰 {gap.cost}</span>
      </div>
    </div>
  )
}

const PAGE: React.CSSProperties = {
  maxWidth: '820px', margin: '0 auto', padding: '40px 36px',
  background: 'white', marginBottom: '4px',
  pageBreakAfter: 'always' as const,
  minHeight: '277mm', boxSizing: 'border-box' as const,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const TOTAL = 8

export default function SOCReportPage() {
  const params = useParams()
  const id = params?.id as string
  const [scan, setScan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/pulse/soc?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data || data.error) setErr(data?.error || 'Report not found')
        else setScan(data)
        setLoading(false)
      })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ color: '#7c3aed', fontSize: '14px' }}>Loading SOC report...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (err || !scan) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
      <div style={{ color: '#dc2626', fontSize: '16px', fontWeight: 700 }}>Report not found</div>
      <div style={{ color: '#6b7280', fontSize: '13px' }}>{err}</div>
      <a href="/pulse/soc" style={{ color: '#7c3aed', fontSize: '13px' }}>← Back to SOC Scanner</a>
    </div>
  )

  const ev = scan.evidence || {}
  const sec = ev.security || {}
  const email = ev.email_security || {}
  const avail = ev.availability || {}
  const priv = ev.privacy || {}
  const gaps: any[] = scan.gaps || []
  const criticalGaps = gaps.filter(g => g.severity === 'Critical')
  const highGaps = gaps.filter(g => g.severity === 'High')
  const medLowGaps = gaps.filter(g => ['Medium', 'Low'].includes(g.severity))

  const domain = scan.hostname || scan.url
  const date = new Date(scan.scanned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  function downloadPDF() {
    const prev = document.title
    document.title = `Klaro Pulse SOC — ${domain} — ${date}`
    window.print()
    setTimeout(() => { document.title = prev }, 2000)
  }

  const hdr = (page: number, section: string) => (
    <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px', marginBottom: '24px', fontSize: '10px', color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
      KLARO PULSE SOC READINESS · {section.toUpperCase()} · PAGE {page} OF {TOTAL} · {date.toUpperCase()} · CONFIDENTIAL
    </div>
  )

  const foot = (page: number) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#9ca3af' }}>
      <span>{domain} | {scan.url}</span>
      <span>Klaro Pulse SOC Readiness · klaro.services/pulse · Page {page}/{TOTAL} · © 2026 Klaro Global</span>
    </div>
  )

  return (
    <>
      <style>{`
        @media print { .no-print { display: none !important; } }
        @page { margin: 0; size: A4; }
        body { margin: 0; background: white; }
      `}</style>

      {/* Topbar */}
      <div className="no-print" style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2a3a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ fontSize: '15px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#7c3aed', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>K</div>
          KLARO <span style={{ color: '#a78bfa' }}>PULSE</span>
          <span style={{ fontSize: '11px', color: '#475569', marginLeft: '8px', fontWeight: 400 }}>SOC 2 READINESS REPORT</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/pulse/soc" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none', border: '1px solid #3b4fd8', borderRadius: '8px', padding: '6px 14px' }}>← New Scan</a>
          <button onClick={downloadPDF} style={{ fontSize: '12px', color: 'white', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>⬇ Download PDF</button>
        </div>
      </div>

      {/* PAGE 1 — EXECUTIVE SUMMARY */}
      <div style={PAGE}>
        {hdr(1, 'Executive Summary')}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '6px' }}>🔒 SOC 2 READINESS ASSESSMENT</div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', marginBottom: '4px', lineHeight: 1.1 }}>{domain}</div>
            <a href={scan.url} style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}>{scan.url}</a>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Scan date: {date}</div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '72px', fontWeight: 900, color: sc(scan.overall_score), lineHeight: 1 }}>{scan.overall_score}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>/100</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: readinessColor(scan.readiness_level), marginTop: '4px' }}>{scan.readiness_level}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginBottom: '20px' }}>
          <ScoreBox label="Security" val={scan.security_score} sub="35% weight" />
          <ScoreBox label="Availability" val={scan.availability_score} sub="15% weight" />
          <ScoreBox label="Confidentiality" val={scan.confidentiality_score} sub="20% weight" />
          <ScoreBox label="Privacy" val={scan.privacy_score} sub="20% weight" />
          <ScoreBox label="Integrity" val={scan.integrity_score} sub="10% weight" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#dc2626' }}>{criticalGaps.length}</div>
            <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>Critical Gaps</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Fix immediately</div>
          </div>
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '16px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#ea580c' }}>{highGaps.length}</div>
            <div style={{ fontSize: '11px', color: '#9a3412', fontWeight: 600 }}>High Priority</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Fix within 30 days</div>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a' }}>{20 - gaps.length}</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Controls Passing</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>of 20 tested</div>
          </div>
        </div>

        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderLeft: '4px solid #7c3aed', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' as const, marginBottom: '6px' }}>WHAT THIS MEANS</div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.7 }}>
            {scan.overall_score >= 80
              ? `${domain} demonstrates strong SOC 2 readiness. Most Trust Service Criteria controls are in place. Remaining gaps are minor and can be remediated quickly before a formal audit.`
              : scan.overall_score >= 60
              ? `${domain} has a partial SOC 2 posture with key controls in place, but critical gaps remain. Addressing the ${criticalGaps.length + highGaps.length} critical/high gaps should be the immediate priority before engaging a SOC 2 auditor.`
              : scan.overall_score >= 40
              ? `${domain} requires significant work before SOC 2 certification. ${gaps.length} controls need attention. We recommend a 90-day remediation plan before engaging an auditor.`
              : `${domain} is not currently ready for SOC 2 certification. Fundamental security controls are missing. A structured remediation programme is required.`
            }
          </div>
        </div>

        {criticalGaps.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '14px 18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' as const, marginBottom: '10px' }}>⚠ CRITICAL — FIX IMMEDIATELY</div>
            {criticalGaps.map((g: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', borderBottom: '1px solid #fee2e2', fontSize: '12px', color: '#374151' }}>
                <span style={{ color: '#dc2626', fontWeight: 800, minWidth: '20px' }}>0{i + 1}</span>
                <span>{g.control} — <span style={{ color: '#6b7280' }}>{g.fix}</span></span>
              </div>
            ))}
          </div>
        )}
        {foot(1)}
      </div>

      {/* PAGE 2 — SECURITY CONTROLS */}
      <div style={PAGE}>
        {hdr(2, 'Security Controls (CC6)')}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' }}>🔒 SECURITY (CC6) — WEIGHT: 35%</div>
            <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.7 }}>
              Security controls cover logical access (CC6.1), data transmission (CC6.6-CC6.7), and change management (CC8). These are the most heavily weighted SOC 2 controls and the first thing auditors check.
            </div>
          </div>
          <ScoreBox label="Security Score" val={scan.security_score} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '10px' }}>HTTP SECURITY HEADERS</div>
            <Check ok={!!sec.hsts?.present} label={`HSTS ${sec.hsts?.strong ? `(${sec.hsts?.max_age_days}d — Strong)` : sec.hsts?.present ? '(Weak)' : '(Missing)'}`} />
            <Check ok={!!sec.csp?.present} label="Content Security Policy (CSP)" />
            <Check ok={!!sec.x_frame_options?.present} label={`X-Frame-Options ${sec.x_frame_options?.value ? `(${sec.x_frame_options.value})` : ''}`} />
            <Check ok={!!sec.x_content_type_options?.present} label="X-Content-Type-Options: nosniff" />
            <Check ok={!!sec.permissions_policy?.present} label="Permissions-Policy header" />
            <Check ok={!!sec.referrer_policy?.present} label={`Referrer-Policy ${sec.referrer_policy?.value ? `(${sec.referrer_policy.value})` : ''}`} />
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '10px' }}>EMAIL SECURITY (CC6.1)</div>
            <Check ok={!!sec.https_enforced} label="HTTPS enforced" />
            <Check ok={!!email.mx_configured} label={`MX configured ${email.provider ? `(${email.provider})` : ''}`} />
            <Check ok={!!email.spf?.configured} label={`SPF record ${email.spf?.is_permissive ? '(⚠ Too permissive)' : ''}`} />
            <Check ok={!!email.dkim?.configured} label={`DKIM signing ${email.dkim?.selector ? `(selector: ${email.dkim.selector})` : ''}`} />
            <Check ok={!!email.dmarc?.configured} label={`DMARC policy ${email.dmarc?.policy ? `(p=${email.dmarc.policy})` : ''}`} />
            <Check ok={email.dmarc?.policy === 'reject' || email.dmarc?.policy === 'quarantine'} label="DMARC enforcement active" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '10px' }}>ACCESS CONTROL (CC6.3)</div>
            <Check ok={!sec.admin_panel_exposed} label="Admin panel not publicly accessible" />
            <Check ok={!sec.wp_admin_exposed} label="WordPress admin not exposed" />
            <Check ok={!sec.phpmyadmin_exposed} label="phpMyAdmin not exposed" />
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '10px' }}>VULNERABILITY MANAGEMENT (CC2.2)</div>
            <Check ok={!!sec.security_txt?.present} label={`Security.txt ${sec.security_txt?.has_expiry ? '(with expiry)' : sec.security_txt?.present ? '(no expiry)' : '(missing)'}`} />
            <Check ok={!!sec.bug_bounty_program} label="Vulnerability disclosure policy" />
          </div>
        </div>

        {sec.csp?.value && (
          <div style={{ marginTop: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' as const, marginBottom: '6px' }}>CSP VALUE (EVIDENCE)</div>
            <div style={{ fontSize: '11px', color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' as const }}>{sec.csp.value}</div>
          </div>
        )}
        {foot(2)}
      </div>

      {/* PAGE 3 — HIGH PRIORITY GAPS */}
      <div style={PAGE}>
        {hdr(3, 'High Priority Gaps')}
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>
          🔴 {criticalGaps.length} CRITICAL · 🟠 {highGaps.length} HIGH PRIORITY — REMEDIATE WITHIN 30 DAYS
        </div>
        {[...criticalGaps, ...highGaps].map((gap: any, i: number) => <Gap key={i} gap={gap} />)}
        {foot(3)}
      </div>

      {/* PAGE 4 — PRIVACY & COMPLIANCE */}
      <div style={PAGE}>
        {hdr(4, 'Privacy & Compliance (P1-P8)')}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' }}>👤 PRIVACY (P1-P8) — WEIGHT: 20%</div>
            <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.7 }}>
              Privacy controls cover how personal data is collected, used, retained, disclosed and disposed of. Covers GDPR, CCPA, India DPDP and other applicable regulations based on your regions of operation.
            </div>
          </div>
          <ScoreBox label="Privacy Score" val={scan.privacy_score} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '10px' }}>REGULATORY SIGNALS</div>
            <Check ok={!!priv.gdpr_compliant_signals} label="GDPR compliance signals present" />
            <Check ok={!!priv.ccpa_compliant_signals} label="CCPA compliance signals present" />
            <Check ok={!!priv.dpdp_compliant_signals} label="India DPDP compliance signals" />
            <Check ok={!!priv.dsar_process_documented} label="DSAR (data access request) process" />
            <Check ok={!!priv.privacy_contact_available} label="Privacy/DPO contact published" />
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '10px' }}>DATA MANAGEMENT</div>
            <Check ok={!!priv.data_retention_documented} label="Data retention policy documented" />
            <Check ok={!!priv.subprocessors_listed} label="Subprocessor/data processor list" />
            <Check ok={!!priv.encryption_documented} label="Encryption at rest & transit documented" />
          </div>
        </div>

        {medLowGaps.filter((g: any) => g.criterion.includes('Privacy')).length > 0 && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px' }}>PRIVACY GAPS TO REMEDIATE</div>
            {medLowGaps.filter((g: any) => g.criterion.includes('Privacy')).map((gap: any, i: number) => <Gap key={i} gap={gap} />)}
          </div>
        )}
        {foot(4)}
      </div>

      {/* PAGE 5 — AVAILABILITY & CONFIDENTIALITY */}
      <div style={PAGE}>
        {hdr(5, 'Availability & Confidentiality')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>⚡ AVAILABILITY (A1) — 15%</div>
              <ScoreBox label="Score" val={scan.availability_score} />
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <Check ok={!!avail.status_page_detected} label="Status page detected" />
              <Check ok={!!avail.proper_404_page} label="Custom 404 error page" />
              <Check ok={!!avail.robots_txt_present} label="robots.txt present" />
            </div>
            {!avail.status_page_detected && (
              <div style={{ marginTop: '12px', background: '#fff7ed', border: '1px solid #fed7aa', borderLeft: '3px solid #ea580c', borderRadius: '8px', padding: '10px 14px', fontSize: '11px', color: '#374151' }}>
                ⚠ No status page detected. SOC 2 auditors expect evidence of uptime monitoring. Set up status.{domain} using Betterstack or Statuspage.
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0891b2', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>🔐 CONFIDENTIALITY (C1) — 20%</div>
              <ScoreBox label="Score" val={scan.confidentiality_score} />
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <Check ok={!!priv.subprocessors_listed} label="Subprocessor list published (GDPR Art. 28)" />
              <Check ok={!!priv.data_retention_documented} label="Data retention schedule documented" />
              <Check ok={!!priv.encryption_documented} label="Encryption documented in privacy policy" />
              <Check ok={!!sec.csp?.present} label="CSP restricts data to approved origins" />
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px' }}>✅ PROCESSING INTEGRITY (PI1) — 10%</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', flex: 1, marginRight: '16px' }}>
              <Check ok={!!avail.proper_404_page} label="Proper error handling (404 returns 404)" />
              <Check ok={!!sec.csp?.present} label="CSP prevents XSS injection" />
              <Check ok={!!sec.x_content_type_options?.present} label="MIME type protection active" />
              <Check ok={!!avail.robots_txt_present} label="robots.txt controls crawl access" />
            </div>
            <ScoreBox label="Score" val={scan.integrity_score} />
          </div>
        </div>

        {medLowGaps.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px' }}>MEDIUM / LOW GAPS</div>
            {medLowGaps.slice(0, 5).map((gap: any, i: number) => <Gap key={i} gap={gap} />)}
          </div>
        )}
        {foot(5)}
      </div>

      {/* PAGE 6 — EVIDENCE RECORD */}
      <div style={PAGE}>
        {hdr(6, 'Evidence Record')}
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>
          📋 AUDITOR-READY EVIDENCE — COLLECTED {date.toUpperCase()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          {[
            { label: 'HTTPS Enforced', val: sec.https_enforced ? 'Yes ✓' : 'No ✗', ok: sec.https_enforced },
            { label: 'HSTS Max-Age', val: sec.hsts?.present ? `${sec.hsts.max_age_days} days` : 'Not set', ok: sec.hsts?.strong },
            { label: 'CSP Header', val: sec.csp?.present ? 'Present ✓' : 'Missing ✗', ok: sec.csp?.present },
            { label: 'X-Frame-Options', val: sec.x_frame_options?.value || 'Missing', ok: sec.x_frame_options?.present },
            { label: 'X-Content-Type', val: sec.x_content_type_options?.present ? 'nosniff ✓' : 'Missing ✗', ok: sec.x_content_type_options?.present },
            { label: 'Referrer-Policy', val: sec.referrer_policy?.value || 'Missing', ok: sec.referrer_policy?.present },
            { label: 'SPF Record', val: email.spf?.configured ? `Configured ✓ ${email.spf?.is_permissive ? '(⚠ permissive)' : ''}` : 'Missing ✗', ok: email.spf?.configured },
            { label: 'DKIM Signing', val: email.dkim?.configured ? `Configured ✓ (${email.dkim?.selector})` : 'Not configured ✗', ok: email.dkim?.configured },
            { label: 'DMARC Policy', val: email.dmarc?.configured ? `p=${email.dmarc?.policy} ✓` : 'Missing ✗', ok: email.dmarc?.configured },
            { label: 'Admin Panel', val: sec.admin_panel_exposed ? 'EXPOSED ✗' : 'Protected ✓', ok: !sec.admin_panel_exposed },
            { label: 'Security.txt', val: sec.security_txt?.present ? 'Present ✓' : 'Missing ✗', ok: sec.security_txt?.present },
            { label: 'Status Page', val: avail.status_page_detected ? 'Detected ✓' : 'Not found ✗', ok: avail.status_page_detected },
            { label: 'GDPR Signals', val: priv.gdpr_compliant_signals ? 'Present ✓' : 'Not found ✗', ok: priv.gdpr_compliant_signals },
            { label: 'CCPA Signals', val: priv.ccpa_compliant_signals ? 'Present ✓' : 'Not found ✗', ok: priv.ccpa_compliant_signals },
            { label: 'India DPDP', val: priv.dpdp_compliant_signals ? 'Present ✓' : 'Not found ✗', ok: priv.dpdp_compliant_signals },
            { label: 'DSAR Process', val: priv.dsar_process_documented ? 'Documented ✓' : 'Not found ✗', ok: priv.dsar_process_documented },
            { label: 'Subprocessors', val: priv.subprocessors_listed ? 'Listed ✓' : 'Not listed ✗', ok: priv.subprocessors_listed },
            { label: 'Data Retention', val: priv.data_retention_documented ? 'Documented ✓' : 'Not documented ✗', ok: priv.data_retention_documented },
            { label: 'Privacy Contact', val: priv.privacy_contact_available ? 'Present ✓' : 'Missing ✗', ok: priv.privacy_contact_available },
            { label: 'Encryption Docs', val: priv.encryption_documented ? 'Documented ✓' : 'Not documented ✗', ok: priv.encryption_documented },
          ].map(({ label, val, ok }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', fontSize: '11px' }}>
              <span style={{ color: '#6b7280', fontWeight: 500 }}>{label}</span>
              <span style={{ fontWeight: 700, color: ok ? '#16a34a' : '#dc2626' }}>{String(val)}</span>
            </div>
          ))}
        </div>
        {foot(6)}
      </div>

      {/* PAGE 7 — REMEDIATION ROADMAP */}
      <div style={PAGE}>
        {hdr(7, 'Remediation Roadmap')}
        <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '20px' }}>
          90-DAY SOC 2 REMEDIATION PLAN
        </div>

        {[
          {
            label: 'Week 1 — Zero Cost Quick Wins', color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
            items: gaps.filter(g => g.cost === '$0' && ['Critical', 'High'].includes(g.severity)).slice(0, 5)
          },
          {
            label: 'Month 1 — Foundation', color: '#d97706', bg: '#fffbeb', border: '#fde68a',
            items: gaps.filter(g => g.severity === 'Medium').slice(0, 5)
          },
          {
            label: 'Month 2–3 — Policies & Documentation', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
            items: gaps.filter(g => g.severity === 'Low').slice(0, 4)
          },
        ].map(({ label, color, bg, border, items }) => items.length > 0 && (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderTop: `4px solid ${color}`, borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color, marginBottom: '10px' }}>{label}</div>
            {items.map((g: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', borderBottom: `1px solid ${border}`, fontSize: '11px', color: '#374151', alignItems: 'flex-start' }}>
                <span style={{ color, fontWeight: 800, minWidth: '18px' }}>{i + 1}.</span>
                <div>
                  <span style={{ fontWeight: 600 }}>{g.control}</span>
                  <span style={{ color: '#6b7280' }}> — {g.fix}</span>
                  <span style={{ color: '#9ca3af', marginLeft: '6px' }}>({g.effort})</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ background: 'linear-gradient(135deg,#faf5ff,#eff6ff)', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '20px', textAlign: 'center' as const, marginTop: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>Ready to become SOC 2 certified?</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Klaro Pulse handles your remediation, evidence collection, and auditor coordination.
          </div>
          <div style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 700 }}>
            SOC 2 Readiness Audit: $7,999 · Monthly Monitoring: $1,299/mo
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>ops@klaro.services · klaro.services/pulse</div>
        </div>
        {foot(7)}
      </div>

      {/* PAGE 8 — ABOUT & METHODOLOGY */}
      <div style={{ ...PAGE, pageBreakAfter: 'avoid' as const }}>
        {hdr(8, 'Methodology & About')}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          {[
            { icon: '🔒', title: 'Security Headers', desc: 'We check all 6 critical HTTP security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, and Referrer-Policy.' },
            { icon: '📧', title: 'Email Security', desc: 'Full SPF, DKIM, DMARC check with provider detection across 30+ email providers and generic selectors.' },
            { icon: '🚪', title: 'Access Control', desc: 'We probe common admin panel paths to detect publicly accessible administrative interfaces that represent critical security risks.' },
            { icon: '📄', title: 'Privacy Evidence', desc: 'We analyse your privacy policy for GDPR, CCPA, DPDP signals, DSAR processes, subprocessor lists, and data retention documentation.' },
            { icon: '⚡', title: 'Availability', desc: 'Status page detection across root path and status subdomain. Proper error handling verification. robots.txt analysis.' },
            { icon: '🔐', title: 'Confidentiality', desc: 'Subprocessor list detection, encryption documentation, data classification signals and CSP configuration analysis.' },
            { icon: '✅', title: 'Processing Integrity', desc: 'Error page verification, input security via CSP, MIME protection and crawl access controls.' },
            { icon: '📊', title: 'Scoring Model', desc: 'Weighted score across 5 SOC 2 Trust Service Criteria: Security 35%, Privacy 20%, Confidentiality 20%, Availability 15%, Integrity 10%.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{title}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' as const, marginBottom: '6px' }}>IMPORTANT DISCLAIMER</div>
          <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.7 }}>
            This SOC 2 readiness assessment is based on publicly observable signals only. It does not access backend systems, internal networks, or authenticated areas. A formal SOC 2 Type 2 certification requires a licensed CPA auditor and covers internal controls that cannot be assessed from outside the organisation. This report should be used as a gap analysis tool to prepare for formal certification, not as a substitute for it.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {[
            { title: 'SOC Readiness Scan', price: '$299', desc: '8-page evidence report' },
            { title: 'SOC 2 Audit Package', price: '$7,999', desc: 'Full remediation + auditor coordination' },
            { title: 'Monthly Monitoring', price: '$1,299/mo', desc: 'Continuous evidence collection' },
          ].map(({ title, price, desc }) => (
            <div key={title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>{title}</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed', marginBottom: '4px' }}>{price}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{desc}</div>
            </div>
          ))}
        </div>
        {foot(8)}
      </div>
    </>
  )
}
