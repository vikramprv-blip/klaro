'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CRITERIA = [
  { key: 'security', label: 'Security', icon: '🔒', desc: 'CC6 — Logical access, encryption, network security', weight: '35%' },
  { key: 'availability', label: 'Availability', icon: '⚡', desc: 'A1 — Uptime, monitoring, incident response', weight: '15%' },
  { key: 'confidentiality', label: 'Confidentiality', icon: '🔐', desc: 'C1 — Data classification, subprocessors, encryption', weight: '20%' },
  { key: 'privacy', label: 'Privacy', icon: '👤', desc: 'P1-P8 — GDPR, CCPA, DPDP, DSAR, retention', weight: '20%' },
  { key: 'integrity', label: 'Processing Integrity', icon: '✅', desc: 'PI1 — Input validation, error handling, CSP', weight: '10%' },
]

const CHECKS = [
  'HTTP security headers (CSP, HSTS, X-Frame-Options...)',
  'Email security (SPF, DKIM, DMARC)',
  'Admin panel exposure scan',
  'Security.txt & vulnerability disclosure',
  'Status page & availability signals',
  'Privacy policy evidence (GDPR, CCPA, DPDP)',
  'Data subject rights (DSAR) process',
  'Subprocessor & data retention documentation',
  'Encryption documentation',
  'Robots.txt & crawl security',
]

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : score >= 40 ? '#ea580c' : '#dc2626'
  const r = (size / 2) - 8
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div style={{ fontSize: size > 100 ? '28px' : '18px', fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '10px', color: '#64748b' }}>/100</div>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Critical: 'bg-red-900/30 text-red-400 border border-red-800',
    High: 'bg-orange-900/30 text-orange-400 border border-orange-800',
    Medium: 'bg-amber-900/30 text-amber-400 border border-amber-800',
    Low: 'bg-blue-900/30 text-blue-400 border border-blue-800',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[severity] || styles.Low}`}>
      {severity}
    </span>
  )
}

export default function SOCScannerPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function runScan() {
    if (!url.trim()) return
    setScanning(true)
    setResult(null)
    setError('')
    setProgress(0)

    const msgs = [
      [5, 'Connecting to target...'],
      [15, 'Scanning HTTP security headers...'],
      [30, 'Checking DNS records (SPF, DKIM, DMARC)...'],
      [45, 'Testing admin panel exposure...'],
      [55, 'Checking security.txt & disclosure policy...'],
      [65, 'Analysing privacy policy...'],
      [75, 'Checking availability signals...'],
      [85, 'Scoring SOC 2 Trust Service Criteria...'],
      [95, 'Building evidence report...'],
    ]

    let i = 0
    const ticker = setInterval(() => {
      if (i < msgs.length) {
        setProgress(msgs[i][0] as number)
        setProgressMsg(msgs[i][1] as string)
        i++
      }
    }, 800)

    try {
      const scanUrl = url.startsWith('http') ? url : `https://${url}`
      const res = await fetch('/api/pulse/soc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl }),
      })
      clearInterval(ticker)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setProgress(100)
      setProgressMsg('Complete!')
      setResult(data)
    } catch (e: any) {
      clearInterval(ticker)
      setError(e.message)
    } finally {
      setScanning(false)
    }
  }

  const readinessColor = (level: string) => {
    if (level === 'SOC 2 Ready') return 'text-green-400'
    if (level === 'Partially Ready') return 'text-amber-400'
    if (level === 'Needs Work') return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-sm font-bold">K</div>
          <div>
            <span className="font-bold text-white">Klaro</span>
            <span className="font-bold text-violet-400"> Pulse</span>
            <span className="ml-2 text-xs text-gray-500 font-medium">SOC READINESS</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/pulse" className="text-sm text-gray-400 hover:text-white">← Dashboard</a>
          {result && (
            <button
              onClick={() => router.push(`/pulse/soc/${result.id}`)}
              className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Full Report →
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700 rounded-full px-4 py-1.5 text-xs text-violet-300 font-medium mb-4">
            🔒 SOC 2 Readiness Scanner — Evidence-Based
          </div>
          <h1 className="text-3xl font-black text-white mb-3">
            Is Your Website <span className="text-violet-400">SOC 2 Ready?</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            We scan 20+ security controls across all 5 SOC 2 Trust Service Criteria.
            Get an evidence-based readiness report in under 30 seconds.
          </p>
        </div>

        {/* Scanner input */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !scanning && runScan()}
              placeholder="https://yourcompany.com"
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              disabled={scanning}
            />
            <button
              onClick={runScan}
              disabled={scanning || !url.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
            >
              {scanning ? 'Scanning...' : 'Run SOC Scan'}
            </button>
          </div>

          {scanning && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{progressMsg}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              ⚠ {error}
            </div>
          )}
        </div>

        {/* What we check */}
        {!result && !scanning && (
          <>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {CRITERIA.map(c => (
                <div key={c.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="text-xs font-bold text-white mb-1">{c.label}</div>
                  <div className="text-xs text-violet-400 font-medium mb-2">{c.weight}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">What We Check</div>
              <div className="grid grid-cols-2 gap-2">
                {CHECKS.map((check, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
                    {check}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score overview */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">SOC 2 Readiness Score</div>
                  <div className="text-2xl font-black text-white">{result.hostname}</div>
                  <div className={`text-lg font-bold mt-1 ${readinessColor(result.readiness_level)}`}>
                    {result.readiness_level}
                  </div>
                </div>
                <ScoreRing score={result.overall_score} size={120} />
              </div>

              <div className="grid grid-cols-5 gap-3">
                {CRITERIA.map(c => (
                  <div key={c.key} className="text-center">
                    <ScoreRing score={result.scores[c.key]} size={72} />
                    <div className="text-xs text-gray-400 mt-2 font-medium">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gap summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Critical Gaps', count: result.gaps.filter((g: any) => g.severity === 'Critical').length, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800' },
                { label: 'High Priority', count: result.gaps.filter((g: any) => g.severity === 'High').length, color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800' },
                { label: 'Medium / Low', count: result.gaps.filter((g: any) => ['Medium', 'Low'].includes(g.severity)).length, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-800' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className={`border rounded-xl p-4 text-center ${bg}`}>
                  <div className={`text-3xl font-black ${color}`}>{count}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Gaps list */}
            {result.gaps.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <div className="text-sm font-bold text-white mb-4">
                  Compliance Gaps — {result.gaps.length} controls need attention
                </div>
                <div className="space-y-3">
                  {result.gaps.map((gap: any, i: number) => (
                    <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="text-sm font-semibold text-white">{gap.control}</div>
                        <SeverityBadge severity={gap.severity} />
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        <span className="text-violet-400">{gap.criterion}</span>
                      </div>
                      <div className="text-xs text-gray-300 mb-2">🔧 {gap.fix}</div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>⏱ {gap.effort}</span>
                        <span>💰 {gap.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-700 rounded-2xl p-6 text-center">
              <div className="text-lg font-black text-white mb-2">
                Get the Full SOC Readiness Report
              </div>
              <div className="text-sm text-gray-300 mb-4">
                10-page evidence report with remediation roadmap, auditor-ready documentation, and ongoing monitoring.
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push(`/pulse/soc/${result.id}`)}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold"
                >
                  View Full Report →
                </button>
                <a
                  href="mailto:ops@klaro.services?subject=SOC Readiness Audit"
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Talk to an expert →
                </a>
              </div>
              <div className="text-xs text-gray-500 mt-3">
                SOC 2 Readiness Audit from $7,999 · Monthly monitoring from $1,299/mo
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
