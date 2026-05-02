'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const CRITERIA = [
  { key: 'security_score', label: 'Security', color: '#dc2626', criterion: 'CC6' },
  { key: 'availability_score', label: 'Availability', color: '#2563eb', criterion: 'A1' },
  { key: 'confidentiality_score', label: 'Confidentiality', color: '#0891b2', criterion: 'C1' },
  { key: 'privacy_score', label: 'Privacy', color: '#7c3aed', criterion: 'P1-P8' },
  { key: 'integrity_score', label: 'Integrity', color: '#16a34a', criterion: 'PI1' },
]

function MiniBar({ val, max = 100, color }: { val: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: '28px', textAlign: 'right' as const }}>{val}</span>
    </div>
  )
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null
  const diff = current - previous
  if (diff === 0) return <span style={{ color: '#6b7280', fontSize: '11px' }}>→ 0</span>
  if (diff > 0) return <span style={{ color: '#16a34a', fontSize: '11px' }}>↑ +{diff}</span>
  return <span style={{ color: '#dc2626', fontSize: '11px' }}>↓ {diff}</span>
}

function ScoreCard({ label, score, prev, color }: { label: string; score: number; prev?: number; color: string }) {
  const bg = score >= 80 ? '#f0fdf4' : score >= 60 ? '#fffbeb' : score >= 40 ? '#fff7ed' : '#fef2f2'
  const border = score >= 80 ? '#bbf7d0' : score >= 60 ? '#fde68a' : score >= 40 ? '#fed7aa' : '#fecaca'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '14px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
        {prev !== undefined && <TrendArrow current={score} previous={prev} />}
      </div>
    </div>
  )
}

export default function SOCEvidencePage() {
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHost, setSelectedHost] = useState<string>('all')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch('/api/pulse/soc')
      .then(r => r.json())
      .then(data => {
        setScans(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const hosts = [...new Set(scans.map(s => s.hostname))]
  const filtered = selectedHost === 'all' ? scans : scans.filter(s => s.hostname === selectedHost)
  const latest = filtered[0]
  const previous = filtered[1]

  // Calculate improvement over time
  const firstScan = filtered[filtered.length - 1]
  const totalImprovement = latest && firstScan ? latest.overall_score - firstScan.overall_score : 0

  // Control pass rate
  const avgGaps = filtered.length > 0 ? Math.round(filtered.reduce((a, s) => a + (s.gaps_count || 0), 0) / filtered.length) : 0
  const controlsFixed = latest && firstScan ? Math.max(0, (firstScan.gaps_count || 0) - (latest.gaps_count || 0)) : 0

  async function exportAuditPack() {
    setExporting(true)
    // Build evidence pack as JSON for now
    const pack = {
      generated_at: new Date().toISOString(),
      generated_by: 'Klaro Pulse SOC Evidence Locker',
      hostname: selectedHost === 'all' ? 'All sites' : selectedHost,
      scan_count: filtered.length,
      latest_score: latest?.overall_score,
      readiness_level: latest?.readiness_level,
      scans: filtered.map(s => ({
        date: s.scanned_at,
        overall: s.overall_score,
        security: s.security_score,
        availability: s.availability_score,
        confidentiality: s.confidentiality_score,
        privacy: s.privacy_score,
        integrity: s.integrity_score,
        gaps_count: s.gaps_count,
        critical_gaps: s.critical_gaps,
        readiness: s.readiness_level,
      })),
      current_gaps: latest?.gaps || [],
      evidence: latest?.evidence || {},
    }
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `soc-evidence-${selectedHost === 'all' ? 'all-sites' : selectedHost}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    setExporting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#7c3aed' }}>Loading evidence locker...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: 'white' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e2a3a', background: '#0d1420', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/pulse/soc" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none' }}>← SOC Scanner</Link>
          <span style={{ color: '#1e2a3a' }}>|</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Evidence Locker</span>
          <span style={{ fontSize: '11px', color: '#475569', background: '#1e293b', padding: '2px 8px', borderRadius: '20px' }}>12-Month History</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedHost}
            onChange={e => setSelectedHost(e.target.value)}
            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="all">All sites</option>
            {hosts.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <button
            onClick={exportAuditPack}
            disabled={exporting || !latest}
            style={{ fontSize: '12px', color: 'white', background: '#7c3aed', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : '⬇ Export for Auditor'}
          </button>
          <Link href="/pulse/soc" style={{ fontSize: '12px', color: 'white', background: '#16a34a', textDecoration: 'none', borderRadius: '8px', padding: '6px 14px', fontWeight: 600 }}>
            + New Scan
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>No scans yet</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Run your first SOC scan to start building your evidence locker</div>
            <Link href="/pulse/soc" style={{ background: '#7c3aed', color: 'white', textDecoration: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px' }}>
              Run SOC Scan →
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Scans', val: filtered.length, sub: 'evidence snapshots', color: '#7c3aed' },
                { label: 'Current Score', val: latest?.overall_score || 0, sub: latest?.readiness_level || '—', color: latest?.overall_score >= 80 ? '#16a34a' : latest?.overall_score >= 60 ? '#d97706' : '#dc2626' },
                { label: 'Score Improvement', val: totalImprovement >= 0 ? `+${totalImprovement}` : totalImprovement, sub: `since first scan`, color: totalImprovement >= 0 ? '#16a34a' : '#dc2626' },
                { label: 'Controls Fixed', val: controlsFixed, sub: 'gaps remediated', color: '#16a34a' },
              ].map(({ label, val, sub, color }) => (
                <div key={label} style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color, lineHeight: 1, marginBottom: '4px' }}>{val}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Latest scores */}
            {latest && (
              <div style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>
                  LATEST SCAN — {new Date(latest.scanned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {latest.hostname && <span style={{ color: '#7c3aed', marginLeft: '8px' }}>{latest.hostname}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
                  {CRITERIA.map(c => (
                    <ScoreCard
                      key={c.key}
                      label={c.label}
                      score={latest[c.key] || 0}
                      prev={previous?.[c.key]}
                      color={c.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Scan history table */}
            <div style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>
                SCAN HISTORY — {filtered.length} snapshots
              </div>
              <div style={{ overflowX: 'auto' as const }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                      {['Date', 'Site', 'Overall', 'Security', 'Privacy', 'Availability', 'Gaps', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left' as const, color: '#475569', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase' as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((scan, i) => {
                      const sc = scan.overall_score
                      const color = sc >= 80 ? '#16a34a' : sc >= 60 ? '#d97706' : sc >= 40 ? '#ea580c' : '#dc2626'
                      return (
                        <tr key={scan.id} style={{ borderBottom: '1px solid #0f172a' }}>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                            {new Date(scan.scanned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 600 }}>{scan.hostname}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 900, color }}>{sc}</span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{scan.security_score}</td>
                          <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{scan.privacy_score}</td>
                          <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{scan.availability_score}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ color: scan.critical_gaps > 0 ? '#dc2626' : '#d97706' }}>
                              {scan.gaps_count} ({scan.critical_gaps} critical)
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color, background: `${color}20`, border: `1px solid ${color}40`, borderRadius: '20px', padding: '2px 8px' }}>
                              {scan.readiness_level}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <Link href={`/pulse/soc/${scan.id}`} style={{ color: '#818cf8', fontSize: '11px', textDecoration: 'none' }}>
                              Report →
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Score trend chart */}
            {filtered.length > 1 && (
              <div style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>
                  SCORE TREND
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
                  {[...filtered].reverse().map((scan, i) => {
                    const sc = scan.overall_score
                    const color = sc >= 80 ? '#16a34a' : sc >= 60 ? '#d97706' : sc >= 40 ? '#ea580c' : '#dc2626'
                    return (
                      <div key={scan.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px' }}>
                        <div style={{ fontSize: '10px', color, fontWeight: 700 }}>{sc}</div>
                        <div style={{ width: '100%', height: `${sc}%`, background: color, borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                        <div style={{ fontSize: '9px', color: '#475569', textAlign: 'center' as const }}>
                          {new Date(scan.scanned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Current gaps evidence */}
            {latest?.gaps?.length > 0 && (
              <div style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>
                  CURRENT GAPS — {latest.gaps.length} controls ({latest.critical_gaps} critical)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {latest.gaps.map((gap: any, i: number) => {
                    const colors: Record<string, string> = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#2563eb' }
                    const color = colors[gap.severity] || '#6b7280'
                    return (
                      <div key={i} style={{ background: '#0f172a', border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>{gap.control}</div>
                          <span style={{ fontSize: '9px', fontWeight: 700, color, whiteSpace: 'nowrap' as const, marginLeft: '8px' }}>{gap.severity}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#7c3aed', marginBottom: '3px' }}>{gap.criterion}</div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>⏱ {gap.effort} · 💰 {gap.cost}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
