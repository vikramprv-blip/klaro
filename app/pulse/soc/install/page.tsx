'use client'
import Link from 'next/link'

const STEPS = [
  {
    step: '01',
    title: 'Download the agent',
    desc: 'Download the Klaro SOC Agent script. It\'s a single Python file — no Docker, no complex setup.',
    code: 'curl -o klaro-soc-agent.py https://klaro.services/api/pulse/soc/download',
  },
  {
    step: '02',
    title: 'Install dependencies',
    desc: 'The agent needs only one external library. Python 3.8+ required.',
    code: 'pip install requests',
  },
  {
    step: '03',
    title: 'Run the scan',
    desc: 'Run from inside your project directory. Replace YOUR_TOKEN with your token from the dashboard, and YOUR_URL with your site.',
    code: 'python3 klaro-soc-agent.py --token YOUR_TOKEN --url https://yoursite.com --scan-path .',
  },
  {
    step: '04',
    title: 'View results',
    desc: 'Results are automatically saved to your Klaro dashboard. The scan takes 60-120 seconds.',
    code: '# Results appear at:\n# https://klaro.services/pulse/soc/evidence',
  },
]

const WHAT_IT_SCANS = [
  { icon: '🔌', title: 'Open Ports', desc: 'Scans 15 sensitive ports including database ports (3306, 5432, 27017), Redis (6379), Elasticsearch (9200), and dev servers' },
  { icon: '🔑', title: 'Secrets & API Keys', desc: 'Scans your codebase for accidentally committed API keys, passwords, database URLs, and AWS credentials' },
  { icon: '📦', title: 'Dependency CVEs', desc: 'Runs npm audit and pip audit to find known vulnerabilities in your dependencies' },
  { icon: '🔒', title: 'SSL Certificate', desc: 'Checks certificate validity and expiry — alerts you 30 days before renewal needed' },
  { icon: '🚪', title: 'Admin Panel Exposure', desc: 'Tests 12 common admin paths to detect publicly accessible administrative interfaces' },
  { icon: '📋', title: 'HTTP Headers', desc: 'Verifies all 6 critical security headers from inside your network' },
]

export default function SOCInstallPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: 'white' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e2a3a', background: '#0d1420', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/pulse/soc" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none' }}>← SOC Scanner</Link>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>Internal Agent — Install Guide</span>
        </div>
        <Link href="/pulse/soc/evidence" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none', border: '1px solid #3b4fd8', borderRadius: '8px', padding: '6px 14px' }}>
          Evidence Locker →
        </Link>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
            🔒 Phase 2 — Internal Infrastructure Scanner
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '12px', lineHeight: 1.2 }}>
            Scan What We Can't See<br /><span style={{ color: '#7c3aed' }}>From Outside</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
            The cloud scanner checks your public-facing site. The internal agent runs inside your network and scans secrets, dependencies, open ports, and admin exposure — things no external scanner can see.
          </p>
        </div>

        {/* What it scans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '48px' }}>
          {WHAT_IT_SCANS.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '18px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Install steps */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '24px' }}>
            INSTALLATION — 4 STEPS, UNDER 5 MINUTES
          </div>
          {STEPS.map(({ step, title, desc, code }) => (
            <div key={step} style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
              <div style={{ flexShrink: 0, width: '36px', height: '36px', background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: 'white' }}>
                {step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', lineHeight: 1.6 }}>{desc}</div>
                <div style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#a5f3fc', whiteSpace: 'pre' as const, overflowX: 'auto' as const }}>
                  {code}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full command options */}
        <div style={{ background: '#0d1420', border: '1px solid #1e2a3a', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>ALL OPTIONS</div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#e2e8f0', lineHeight: 2 }}>
            <div><span style={{ color: '#7c3aed' }}>--token</span> <span style={{ color: '#6b7280' }}>YOUR_TOKEN</span>{'    '}<span style={{ color: '#475569' }}># Required. From your dashboard</span></div>
            <div><span style={{ color: '#7c3aed' }}>--url</span> <span style={{ color: '#6b7280' }}>https://yoursite.com</span>{'    '}<span style={{ color: '#475569' }}># Required. Your website URL</span></div>
            <div><span style={{ color: '#7c3aed' }}>--scan-path</span> <span style={{ color: '#6b7280' }}>.</span>{'    '}<span style={{ color: '#475569' }}># Path to scan for secrets. Default: current dir</span></div>
            <div><span style={{ color: '#7c3aed' }}>--scan-id</span> <span style={{ color: '#6b7280' }}>UUID</span>{'    '}<span style={{ color: '#475569' }}># Link to a cloud scan for combined report</span></div>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{ background: '#0f172a', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', marginBottom: '8px' }}>🔒 Privacy & Data Handling</div>
          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.7 }}>
            The agent sends only scan <strong style={{ color: '#94a3b8' }}>results</strong> to Klaro — never your source code, file contents, or actual secret values. Secret pattern matches report the file path and type only, not the secret itself. All data is encrypted in transit via HTTPS and stored in your private Supabase account.
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <a
            href="/api/pulse/soc/download"
            style={{ background: '#7c3aed', color: 'white', textDecoration: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textAlign: 'center' as const, display: 'block' }}
          >
            ⬇ Download Agent Script
          </a>
          <Link
            href="/pulse/soc/evidence"
            style={{ background: '#1e293b', color: 'white', textDecoration: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textAlign: 'center' as const, display: 'block', border: '1px solid #334155' }}
          >
            View Evidence Locker →
          </Link>
        </div>

      </div>
    </div>
  )
}
