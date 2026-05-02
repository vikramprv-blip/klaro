import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── DNS helper ────────────────────────────────────────────────────────────────
async function dnsLookup(name: string, type: string) {
  try {
    const r = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(6000) }
    )
    const d = await r.json()
    return d.Answer || []
  } catch { return [] }
}

async function fetchHeaders(url: string): Promise<Record<string, string>> {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) })
    const h: Record<string, string> = {}
    r.headers.forEach((v, k) => { h[k.toLowerCase()] = v })
    return h
  } catch { return {} }
}

async function fetchBody(url: string): Promise<string> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
    return await r.text()
  } catch { return '' }
}

async function fetchStatus(url: string): Promise<number> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) })
    return r.status
  } catch { return 0 }
}

// ── SSL Labs analysis (free, no key required) ─────────────────────────────────
async function checkSSLLabs(hostname: string) {
  try {
    // Start analysis
    const startRes = await fetch(
      `https://api.ssllabs.com/api/v3/analyze?host=${hostname}&startNew=on&all=done&ignoreMismatch=on`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!startRes.ok) return null
    const startData = await startRes.json()

    // If already cached/ready
    if (startData.status === 'READY' && startData.endpoints?.[0]) {
      const ep = startData.endpoints[0]
      return {
        grade: ep.grade || 'Unknown',
        grade_trust_ignored: ep.gradeTrustIgnored,
        has_warnings: ep.hasWarnings,
        is_exceptional: ep.isExceptional,
        progress: ep.progress,
        status: startData.status,
        protocol: ep.details?.protocols?.map((p: any) => p.name + p.version).join(', ') || '',
        forward_secrecy: ep.details?.forwardSecrecy,
        heartbleed: ep.details?.heartbleed,
        poodle: ep.details?.poodle,
        hsts_policy: ep.details?.hstsPolicy?.status,
        hsts_preload: ep.details?.hstsPreloads?.length > 0,
      }
    }

    // Return partial if still processing
    return {
      grade: startData.endpoints?.[0]?.grade || 'Scanning...',
      status: startData.status,
      progress: startData.endpoints?.[0]?.progress || 0,
    }
  } catch (e) {
    return null
  }
}

// ── HaveIBeenPwned domain search (free) ───────────────────────────────────────
async function checkHIBP(hostname: string) {
  try {
    // Get breaches for domain
    const r = await fetch(
      `https://haveibeenpwned.com/api/v3/breacheddomain/${hostname}`,
      {
        headers: {
          'User-Agent': 'Klaro-Pulse-SOC-Scanner',
          'hibp-api-key': process.env.HIBP_API_KEY || '',
        },
        signal: AbortSignal.timeout(8000)
      }
    )
    if (r.status === 404) return { breached: false, breach_count: 0, breaches: [] }
    if (r.status === 401) {
      // No API key — use public breach check instead
      const pubRes = await fetch(
        `https://haveibeenpwned.com/api/v3/breaches?domain=${hostname}`,
        { headers: { 'User-Agent': 'Klaro-Pulse-SOC-Scanner' }, signal: AbortSignal.timeout(8000) }
      )
      if (!pubRes.ok) return null
      const breaches = await pubRes.json()
      return {
        breached: breaches.length > 0,
        breach_count: breaches.length,
        breaches: breaches.slice(0, 5).map((b: any) => ({
          name: b.Name,
          date: b.BreachDate,
          data_classes: b.DataClasses?.slice(0, 4),
          pwn_count: b.PwnCount,
        })),
        most_recent: breaches[0]?.BreachDate || null,
      }
    }
    if (!r.ok) return null
    const data = await r.json()
    const breachNames = Object.keys(data)
    return {
      breached: breachNames.length > 0,
      breach_count: breachNames.length,
      breaches: breachNames.slice(0, 5),
      raw: data,
    }
  } catch { return null }
}

// ── Shodan host lookup (free, no key for basic) ───────────────────────────────
async function checkShodan(hostname: string) {
  try {
    // DNS resolve hostname to IP first
    const dnsRes = await fetch(
      `https://dns.google/resolve?name=${hostname}&type=A`,
      { signal: AbortSignal.timeout(6000) }
    )
    const dnsData = await dnsRes.json()
    const ip = dnsData.Answer?.[0]?.data
    if (!ip) return null

    // Shodan free host info (no key needed for basic)
    const r = await fetch(
      `https://api.shodan.io/shodan/host/${ip}?key=${process.env.SHODAN_API_KEY || 'PSKINdQe1GyxGgecYz2191H2JoS9qvgD'}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!r.ok) return { ip, error: r.status }
    const data = await r.json()
    return {
      ip,
      isp: data.isp,
      org: data.org,
      country: data.country_name,
      open_ports: data.ports?.slice(0, 20) || [],
      vulns: Object.keys(data.vulns || {}).slice(0, 10),
      tags: data.tags || [],
      last_update: data.last_update,
      hostnames: data.hostnames?.slice(0, 5) || [],
    }
  } catch { return null }
}

// ── Core scanner ──────────────────────────────────────────────────────────────
export async function runSOCScan(url: string, userId: string) {
  let hostname = ''
  try { hostname = new URL(url).hostname } catch { return null }
  const root = `https://${hostname}`

  // Run all checks in parallel
  const [
    headers, txtRecords, mxRecords, dmarcRecords,
    securityTxt, securityTxtAlt,
    adminStatus, wpAdminStatus, phpMyAdminStatus,
    statusPageStatus, statusSubStatus,
    privacyBody, privacyBodyAlt,
    robotsBody, errorPageStatus,
    sslLabsData, hibpData, shodanData,
  ] = await Promise.all([
    fetchHeaders(root),
    dnsLookup(hostname, 'TXT'),
    dnsLookup(hostname, 'MX'),
    dnsLookup(`_dmarc.${hostname}`, 'TXT'),
    fetchBody(`${root}/.well-known/security.txt`),
    fetchBody(`${root}/security.txt`),
    fetchStatus(`${root}/admin`),
    fetchStatus(`${root}/wp-admin`),
    fetchStatus(`${root}/phpmyadmin`),
    fetchStatus(`${root}/status`),
    fetchStatus(`https://status.${hostname}`),
    fetchBody(`${root}/privacy`),
    fetchBody(`${root}/privacy-policy`),
    fetchBody(`${root}/robots.txt`),
    fetchStatus(`${root}/klaro-test-nonexistent-page`),
    checkSSLLabs(hostname),
    checkHIBP(hostname),
    checkShodan(hostname),
  ])

  // DKIM detection
  const mxData = mxRecords.map((r: any) => (r.data || '').toLowerCase())
  let emailProvider = 'Unknown'
  let providerSelectors: string[] = []
  if (mxData.some((m: string) => m.includes('google') || m.includes('gmail'))) {
    emailProvider = 'Google Workspace'; providerSelectors = ['google', 's1', 's2', 'gm1']
  } else if (mxData.some((m: string) => m.includes('outlook') || m.includes('microsoft'))) {
    emailProvider = 'Microsoft 365'; providerSelectors = ['selector1', 'selector2']
  } else if (mxData.some((m: string) => m.includes('zoho'))) {
    emailProvider = 'Zoho Mail'; providerSelectors = ['zoho', 'zmail', 'zm1']
  } else if (mxData.some((m: string) => m.includes('amazonses'))) {
    emailProvider = 'Amazon SES'; providerSelectors = ['ses', 'amazonses']
  } else if (mxData.some((m: string) => m.includes('sendgrid'))) {
    emailProvider = 'SendGrid'; providerSelectors = ['s1', 's2', 'sg']
  } else if (mxData.some((m: string) => m.includes('mailgun'))) {
    emailProvider = 'Mailgun'; providerSelectors = ['mailo', 'pic', 'k1', 'mg']
  }
  const genericSelectors = ['default', 'dkim', 'mail', 'k1', 'k2', 's1', 's2', 'selector1', 'selector2', 'resend', 'postmark', 'brevo', 'pm']
  const allSelectors = [...new Set([...providerSelectors, ...genericSelectors])]

  let dkimFound = false
  let dkimSelector = ''
  for (const sel of allSelectors) {
    const recs = await dnsLookup(`${sel}._domainkey.${hostname}`, 'TXT')
    if (recs.length > 0 && recs.some((r: any) => r.data?.includes('v=DKIM1') || r.data?.includes('p='))) {
      dkimFound = true; dkimSelector = sel; break
    }
  }

  // Parse headers
  const hsts = headers['strict-transport-security'] || null
  const csp = headers['content-security-policy'] || null
  const xFrame = headers['x-frame-options'] || null
  const xContentType = headers['x-content-type-options'] || null
  const permissionsPolicy = headers['permissions-policy'] || null
  const referrerPolicy = headers['referrer-policy'] || null
  const hstsMaxAge = hsts ? parseInt(hsts.match(/max-age=(\d+)/)?.[1] || '0') : 0
  const hstsStrong = hstsMaxAge >= 31536000

  // DNS
  const spfRecord = txtRecords.find((r: any) => r.data?.includes('v=spf1'))
  const spfFound = !!spfRecord
  const spfValue = spfRecord?.data || null
  const dmarcRecord = dmarcRecords.find((r: any) => r.data?.includes('v=DMARC1'))
  const dmarcFound = !!dmarcRecord
  const dmarcPolicy = dmarcRecord?.data?.match(/p=(\w+)/)?.[1] || null

  // Security.txt
  const secTxt = securityTxt.includes('Contact:') ? securityTxt : securityTxtAlt
  const hasSecurityTxt = secTxt.includes('Contact:')
  const hasBugBounty = secTxt.includes('Policy:') ||
    privacyBody.toLowerCase().includes('bug bounty') ||
    privacyBody.toLowerCase().includes('responsible disclosure') ||
    privacyBodyAlt.toLowerCase().includes('bug bounty')

  // Admin exposure
  const adminExposed = adminStatus === 200
  const wpAdminExposed = wpAdminStatus === 200
  const phpMyAdminExposed = phpMyAdminStatus === 200

  // Availability
  const hasStatusPage = statusPageStatus === 200 || statusSubStatus === 200
  const has404Page = errorPageStatus === 404

  // Privacy
  const pBody = (privacyBody + ' ' + privacyBodyAlt).toLowerCase()
  const hasSubprocessorList = pBody.includes('subprocessor') || pBody.includes('sub-processor') || pBody.includes('data processor')
  const hasDSAR = pBody.includes('data subject') || pBody.includes('right to access') || pBody.includes('right to erasure') || pBody.includes('dsar')
  const hasDataRetentionPolicy = pBody.includes('retention period') || pBody.includes('data retention') || pBody.includes('retain your data')
  const hasEncryptionMention = pBody.includes('encrypt') || pBody.includes('aes-') || pBody.includes('at rest') || pBody.includes('in transit')
  const hasGDPR = pBody.includes('gdpr') || pBody.includes('general data protection regulation')
  const hasCCPA = pBody.includes('ccpa') || pBody.includes('california consumer privacy')
  const hasDPDP = pBody.includes('dpdp') || pBody.includes('digital personal data protection')
  const hasPrivacyContact = pBody.includes('privacy@') || pBody.includes('dpo@') || pBody.includes('data protection officer')
  const hasRobotsTxt = robotsBody.length > 10

  // SSL grade scoring
  const sslGradeScore: Record<string, number> = { 'A+': 100, 'A': 95, 'A-': 85, 'B': 70, 'C': 50, 'D': 30, 'E': 20, 'F': 0, 'T': 40 }
  const sslGrade = sslLabsData?.grade || 'Unknown'
  const sslScore = sslGradeScore[sslGrade] ?? 60

  // Breach penalty
  const breachPenalty = hibpData?.breached ? Math.min(30, (hibpData.breach_count || 0) * 5) : 0

  // Shodan open dangerous ports
  const dangerousPorts = [3306, 5432, 6379, 27017, 9200, 5601, 21, 23, 8080]
  const shodanOpenDangerous = (shodanData?.open_ports || []).filter((p: number) => dangerousPorts.includes(p))
  const shodanVulns = shodanData?.vulns || []

  // SOC 2 Trust Service Criteria scores
  let securityScore = 0
  if (url.startsWith('https://')) securityScore += 10
  if (hstsStrong) securityScore += 8
  securityScore += Math.round(sslScore * 0.15) // SSL Labs grade contribution
  if (csp) securityScore += 10
  if (xFrame) securityScore += 7
  if (xContentType) securityScore += 7
  if (permissionsPolicy) securityScore += 5
  if (referrerPolicy) securityScore += 4
  if (spfFound) securityScore += 8
  if (dkimFound) securityScore += 8
  if (dmarcFound) securityScore += 8
  if (dmarcPolicy === 'reject') securityScore += 4
  else if (dmarcPolicy === 'quarantine') securityScore += 2
  if (!adminExposed && !wpAdminExposed && !phpMyAdminExposed) securityScore += 6
  if (shodanOpenDangerous.length === 0) securityScore += 5
  securityScore -= breachPenalty
  securityScore = Math.max(0, Math.min(100, securityScore))

  let availabilityScore = 0
  if (hasStatusPage) availabilityScore += 60
  if (has404Page) availabilityScore += 20
  if (hasRobotsTxt) availabilityScore += 20
  availabilityScore = Math.min(100, availabilityScore)

  let confidentialityScore = 0
  if (hasSubprocessorList) confidentialityScore += 30
  if (hasDataRetentionPolicy) confidentialityScore += 25
  if (hasEncryptionMention) confidentialityScore += 25
  if (csp) confidentialityScore += 20
  confidentialityScore = Math.min(100, confidentialityScore)

  let privacyScore = 0
  if (hasGDPR) privacyScore += 20
  if (hasCCPA) privacyScore += 15
  if (hasDPDP) privacyScore += 15
  if (hasDSAR) privacyScore += 20
  if (hasPrivacyContact) privacyScore += 15
  if (hasDataRetentionPolicy) privacyScore += 15
  privacyScore = Math.min(100, privacyScore)

  let integrityScore = 0
  if (has404Page) integrityScore += 30
  if (csp) integrityScore += 30
  if (xContentType) integrityScore += 20
  if (hasRobotsTxt) integrityScore += 20
  integrityScore = Math.min(100, integrityScore)

  const overallScore = Math.round(
    securityScore * 0.35 + availabilityScore * 0.15 +
    confidentialityScore * 0.20 + privacyScore * 0.20 + integrityScore * 0.10
  )

  const readinessLevel =
    overallScore >= 80 ? 'SOC 2 Ready' :
    overallScore >= 60 ? 'Partially Ready' :
    overallScore >= 40 ? 'Needs Work' : 'Not Ready'

  // Build gaps
  const gaps: { control: string; criterion: string; severity: string; fix: string; effort: string; cost: string }[] = []

  if (adminExposed) gaps.push({ control: 'Admin Panel Publicly Accessible', criterion: 'Security (CC6.3)', severity: 'Critical', fix: 'Restrict /admin to authenticated users + IP allowlist', effort: '1 day', cost: '$0' })
  if (wpAdminExposed) gaps.push({ control: 'WordPress Admin Exposed', criterion: 'Security (CC6.3)', severity: 'Critical', fix: 'Restrict /wp-admin, enforce 2FA', effort: '1 day', cost: '$0' })
  if (hibpData?.breached) gaps.push({ control: `Domain found in ${hibpData.breach_count} data breach${hibpData.breach_count > 1 ? 'es' : ''}`, criterion: 'Security (CC7.2)', severity: 'Critical', fix: 'Rotate all credentials, notify affected users, review breach scope', effort: '1-3 days', cost: '$0' })
  if (shodanVulns.length > 0) gaps.push({ control: `${shodanVulns.length} known CVE${shodanVulns.length > 1 ? 's' : ''} detected: ${shodanVulns.slice(0, 3).join(', ')}`, criterion: 'Security (CC7.1)', severity: 'Critical', fix: 'Patch vulnerable services immediately', effort: '1-5 days', cost: '$0-500' })
  if (shodanOpenDangerous.length > 0) gaps.push({ control: `Dangerous ports exposed: ${shodanOpenDangerous.join(', ')}`, criterion: 'Security (CC6.6)', severity: 'High', fix: 'Close or firewall these ports from public access', effort: '2 hours', cost: '$0' })
  if (!csp) gaps.push({ control: 'No Content Security Policy', criterion: 'Security (CC6.6)', severity: 'High', fix: 'Add Content-Security-Policy header via Next.js config or reverse proxy', effort: '2-4 hours', cost: '$0' })
  if (!hstsStrong) gaps.push({ control: 'HSTS Not Strong Enough', criterion: 'Security (CC6.7)', severity: 'High', fix: 'Set Strict-Transport-Security: max-age=63072000; includeSubDomains; preload', effort: '1 hour', cost: '$0' })
  if (sslGrade && !['A+', 'A', 'A-'].includes(sslGrade) && sslGrade !== 'Unknown') gaps.push({ control: `SSL Grade: ${sslGrade} (target A or higher)`, criterion: 'Security (CC6.7)', severity: 'High', fix: 'Upgrade TLS configuration, disable weak ciphers, enable forward secrecy', effort: '2-4 hours', cost: '$0' })
  if (!spfFound) gaps.push({ control: 'No SPF Record', criterion: 'Security (CC6.1)', severity: 'High', fix: `Add SPF TXT record: v=spf1 include:your-provider ~all`, effort: '30 mins', cost: '$0' })
  if (!dkimFound) gaps.push({ control: 'No DKIM Signing', criterion: 'Security (CC6.1)', severity: 'High', fix: `Enable DKIM in ${emailProvider} and publish DNS key`, effort: '1-2 hours', cost: '$0' })
  if (!dmarcFound) gaps.push({ control: 'No DMARC Policy', criterion: 'Security (CC6.1)', severity: 'High', fix: `Add _dmarc.${hostname} TXT: v=DMARC1; p=quarantine; rua=mailto:dmarc@${hostname}`, effort: '30 mins', cost: '$0' })
  if (dmarcFound && dmarcPolicy === 'none') gaps.push({ control: 'DMARC Not Enforced', criterion: 'Security (CC6.1)', severity: 'Medium', fix: 'Change DMARC policy from p=none to p=quarantine or p=reject', effort: '15 mins', cost: '$0' })
  if (!xFrame) gaps.push({ control: 'No Clickjacking Protection', criterion: 'Security (CC6.6)', severity: 'High', fix: 'Add X-Frame-Options: SAMEORIGIN header', effort: '1 hour', cost: '$0' })
  if (!xContentType) gaps.push({ control: 'No MIME Sniffing Protection', criterion: 'Security (CC6.6)', severity: 'Medium', fix: 'Add X-Content-Type-Options: nosniff header', effort: '1 hour', cost: '$0' })
  if (!permissionsPolicy) gaps.push({ control: 'No Permissions Policy', criterion: 'Security (CC6.6)', severity: 'Medium', fix: 'Add Permissions-Policy header', effort: '1 hour', cost: '$0' })
  if (!referrerPolicy) gaps.push({ control: 'No Referrer Policy', criterion: 'Privacy (P6)', severity: 'Medium', fix: 'Add Referrer-Policy: strict-origin-when-cross-origin', effort: '1 hour', cost: '$0' })
  if (!hasSecurityTxt) gaps.push({ control: 'No Security.txt', criterion: 'Security (CC2.2)', severity: 'Low', fix: 'Add /.well-known/security.txt with Contact and Expires fields', effort: '30 mins', cost: '$0' })
  if (!hasBugBounty) gaps.push({ control: 'No Vulnerability Disclosure Policy', criterion: 'Security (CC2.2)', severity: 'Medium', fix: 'Publish a responsible disclosure policy page', effort: '1 day', cost: '$0' })
  if (!hasStatusPage) gaps.push({ control: 'No Status Page', criterion: 'Availability (A1.2)', severity: 'Medium', fix: 'Set up status page using Betterstack or Statuspage', effort: '2 hours', cost: '$0-29/mo' })
  if (!hasSubprocessorList) gaps.push({ control: 'No Subprocessor List', criterion: 'Privacy (P6.1)', severity: 'High', fix: 'List third-party data processors in your privacy policy (GDPR Art. 28)', effort: '1 day', cost: '$0' })
  if (!hasDSAR) gaps.push({ control: 'No DSAR Process', criterion: 'Privacy (P8.1)', severity: 'High', fix: 'Add a data subject access request email or form', effort: '2 hours', cost: '$0' })
  if (!hasDataRetentionPolicy) gaps.push({ control: 'No Data Retention Policy', criterion: 'Privacy (P4.2)', severity: 'Medium', fix: 'Document data retention periods in your privacy policy', effort: '1 day', cost: '$0' })
  if (!hasPrivacyContact) gaps.push({ control: 'No Privacy Contact', criterion: 'Privacy (P1.1)', severity: 'Medium', fix: 'Add privacy@ or DPO contact to privacy policy', effort: '30 mins', cost: '$0' })
  if (!hasEncryptionMention) gaps.push({ control: 'Encryption Not Documented', criterion: 'Confidentiality (C1.2)', severity: 'Medium', fix: 'Document encryption at rest and in transit', effort: '2 hours', cost: '$0' })

  const evidence = {
    security: {
      https_enforced: url.startsWith('https://'),
      hsts: { present: !!hsts, strong: hstsStrong, max_age_days: Math.round(hstsMaxAge / 86400), value: hsts },
      csp: { present: !!csp, value: csp?.substring(0, 300) || null },
      x_frame_options: { present: !!xFrame, value: xFrame },
      x_content_type_options: { present: !!xContentType, value: xContentType },
      permissions_policy: { present: !!permissionsPolicy },
      referrer_policy: { present: !!referrerPolicy, value: referrerPolicy },
      admin_panel_exposed: adminExposed,
      wp_admin_exposed: wpAdminExposed,
      phpmyadmin_exposed: phpMyAdminExposed,
      security_txt: { present: hasSecurityTxt, has_expiry: secTxt.includes('Expires:') },
      bug_bounty_program: hasBugBounty,
    },
    ssl_labs: sslLabsData || { grade: 'Not checked', error: 'SSL Labs scan not available' },
    breach_detection: hibpData || { breached: false, breach_count: 0, error: 'HIBP check not available' },
    infrastructure: shodanData || { error: 'Shodan check not available' },
    email_security: {
      provider: emailProvider,
      mx_configured: mxRecords.length > 0,
      spf: { configured: spfFound, value: spfValue, is_permissive: spfValue?.includes('+all') },
      dkim: { configured: dkimFound, selector: dkimSelector },
      dmarc: { configured: dmarcFound, policy: dmarcPolicy, value: dmarcRecord?.data?.substring(0, 200) || null },
    },
    availability: {
      status_page_detected: hasStatusPage,
      proper_404_page: has404Page,
      robots_txt_present: hasRobotsTxt,
    },
    privacy: {
      gdpr_compliant_signals: hasGDPR,
      ccpa_compliant_signals: hasCCPA,
      dpdp_compliant_signals: hasDPDP,
      dsar_process_documented: hasDSAR,
      privacy_contact_available: hasPrivacyContact,
      data_retention_documented: hasDataRetentionPolicy,
      subprocessors_listed: hasSubprocessorList,
      encryption_documented: hasEncryptionMention,
    },
  }

  // Save scan
  const { data: scan, error } = await svc.from('soc_scans').insert({
    user_id: userId,
    url,
    hostname,
    overall_score: overallScore,
    security_score: securityScore,
    availability_score: availabilityScore,
    confidentiality_score: confidentialityScore,
    privacy_score: privacyScore,
    integrity_score: integrityScore,
    readiness_level: readinessLevel,
    gaps_count: gaps.length,
    critical_gaps: gaps.filter(g => g.severity === 'Critical').length,
    high_gaps: gaps.filter(g => g.severity === 'High').length,
    email_provider: emailProvider,
    evidence,
    gaps,
    scanned_at: new Date().toISOString(),
  }).select().single()

  if (error || !scan) return null

  // Write individual control evidence (non-blocking)
  const controls = [
    { id: 'CC6.7-hsts', name: 'HSTS Header', criterion: 'Security (CC6.7)', status: evidence.security.hsts?.strong ? 'pass' : evidence.security.hsts?.present ? 'partial' : 'fail', data: evidence.security.hsts },
    { id: 'CC6.6-csp', name: 'Content Security Policy', criterion: 'Security (CC6.6)', status: evidence.security.csp?.present ? 'pass' : 'fail', data: evidence.security.csp },
    { id: 'CC6.6-xframe', name: 'X-Frame-Options', criterion: 'Security (CC6.6)', status: evidence.security.x_frame_options?.present ? 'pass' : 'fail', data: evidence.security.x_frame_options },
    { id: 'CC6.6-xcontent', name: 'X-Content-Type-Options', criterion: 'Security (CC6.6)', status: evidence.security.x_content_type_options?.present ? 'pass' : 'fail', data: evidence.security.x_content_type_options },
    { id: 'CC6.7-ssl', name: 'SSL Grade', criterion: 'Security (CC6.7)', status: ['A+', 'A', 'A-'].includes(sslGrade) ? 'pass' : sslGrade === 'B' ? 'partial' : 'fail', data: { grade: sslGrade } },
    { id: 'CC7.2-breach', name: 'Breach Detection', criterion: 'Security (CC7.2)', status: hibpData?.breached ? 'fail' : 'pass', data: { breached: hibpData?.breached, count: hibpData?.breach_count } },
    { id: 'CC6.6-ports', name: 'No Dangerous Ports', criterion: 'Security (CC6.6)', status: shodanOpenDangerous.length === 0 ? 'pass' : 'fail', data: { open_dangerous: shodanOpenDangerous } },
    { id: 'CC6.1-spf', name: 'SPF Record', criterion: 'Security (CC6.1)', status: spfFound ? 'pass' : 'fail', data: evidence.email_security.spf },
    { id: 'CC6.1-dkim', name: 'DKIM Signing', criterion: 'Security (CC6.1)', status: dkimFound ? 'pass' : 'fail', data: evidence.email_security.dkim },
    { id: 'CC6.1-dmarc', name: 'DMARC Policy', criterion: 'Security (CC6.1)', status: dmarcFound ? (dmarcPolicy === 'none' ? 'partial' : 'pass') : 'fail', data: evidence.email_security.dmarc },
    { id: 'CC6.3-admin', name: 'Admin Panel Protected', criterion: 'Security (CC6.3)', status: !adminExposed ? 'pass' : 'fail', data: { exposed: adminExposed } },
    { id: 'CC2.2-sectxt', name: 'Security.txt', criterion: 'Security (CC2.2)', status: hasSecurityTxt ? 'pass' : 'fail', data: evidence.security.security_txt },
    { id: 'A1.2-status', name: 'Status Page', criterion: 'Availability (A1.2)', status: hasStatusPage ? 'pass' : 'fail', data: { detected: hasStatusPage } },
    { id: 'P6.1-subprocessors', name: 'Subprocessor List', criterion: 'Privacy (P6.1)', status: hasSubprocessorList ? 'pass' : 'fail', data: { present: hasSubprocessorList } },
    { id: 'P8.1-dsar', name: 'DSAR Process', criterion: 'Privacy (P8.1)', status: hasDSAR ? 'pass' : 'fail', data: { present: hasDSAR } },
    { id: 'P4.2-retention', name: 'Data Retention Policy', criterion: 'Privacy (P4.2)', status: hasDataRetentionPolicy ? 'pass' : 'fail', data: { present: hasDataRetentionPolicy } },
    { id: 'P1.1-gdpr', name: 'GDPR Signals', criterion: 'Privacy (P1.1)', status: hasGDPR ? 'pass' : 'fail', data: { present: hasGDPR } },
    { id: 'P1.1-ccpa', name: 'CCPA Signals', criterion: 'Privacy (P1.1)', status: hasCCPA ? 'pass' : 'fail', data: { present: hasCCPA } },
    { id: 'C1.2-encryption', name: 'Encryption Documented', criterion: 'Confidentiality (C1.2)', status: hasEncryptionMention ? 'pass' : 'fail', data: { present: hasEncryptionMention } },
    { id: 'CC7.1-vulns', name: 'No Known CVEs', criterion: 'Security (CC7.1)', status: shodanVulns.length === 0 ? 'pass' : 'fail', data: { vulns: shodanVulns.slice(0, 5) } },
  ]

  void Promise.resolve(svc.from('soc_evidence').insert(
    controls.map(c => ({
      scan_id: scan.id,
      user_id: userId,
      hostname,
      control_id: c.id,
      control_name: c.name,
      criterion: c.criterion,
      status: c.status,
      evidence_data: c.data || {},
      collected_at: new Date().toISOString(),
    }))
  ))

  return {
    id: scan.id, url, hostname, overall_score: overallScore,
    readiness_level: readinessLevel,
    scores: { security: securityScore, availability: availabilityScore, confidentiality: confidentialityScore, privacy: privacyScore, integrity: integrityScore },
    gaps_count: gaps.length,
    critical_gaps: gaps.filter(g => g.severity === 'Critical').length,
    high_gaps: gaps.filter(g => g.severity === 'High').length,
    ssl_grade: sslGrade,
    breached: hibpData?.breached || false,
    breach_count: hibpData?.breach_count || 0,
    open_dangerous_ports: shodanOpenDangerous,
    known_vulns: shodanVulns.length,
    evidence, gaps,
  }
}

// ── POST /api/pulse/soc ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const result = await runSOCScan(url, user.id)
  if (!result) return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  return NextResponse.json(result)
}

// ── GET /api/pulse/soc ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (id) {
    const { data } = await svc.from('soc_scans').select('*').eq('id', id).eq('user_id', user.id).single()
    return NextResponse.json(data || null)
  }
  const { data } = await svc.from('soc_scans').select('*').eq('user_id', user.id).order('scanned_at', { ascending: false }).limit(20)
  return NextResponse.json(data || [])
}
