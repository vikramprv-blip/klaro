import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  let hostname = ''
  try { hostname = new URL(url).hostname } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
  const root = `https://${hostname}`

  // Run all checks in parallel for speed
  const [
    headers, txtRecords, mxRecords, dmarcRecords,
    securityTxt, securityTxtAlt,
    adminStatus, wpAdminStatus, phpMyAdminStatus,
    statusPageStatus, statusSubStatus,
    privacyBody, privacyBodyAlt,
    robotsBody, errorPageStatus,
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

  // SOC 2 Trust Service Criteria scores
  let securityScore = 0
  if (url.startsWith('https://')) securityScore += 15
  if (hstsStrong) securityScore += 10
  if (csp) securityScore += 12
  if (xFrame) securityScore += 8
  if (xContentType) securityScore += 8
  if (permissionsPolicy) securityScore += 7
  if (referrerPolicy) securityScore += 5
  if (spfFound) securityScore += 8
  if (dkimFound) securityScore += 8
  if (dmarcFound) securityScore += 8
  if (dmarcPolicy === 'reject') securityScore += 5
  else if (dmarcPolicy === 'quarantine') securityScore += 3
  if (!adminExposed && !wpAdminExposed && !phpMyAdminExposed) securityScore += 6
  securityScore = Math.min(100, securityScore)

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

  // Build evidence-based gaps
  const gaps: { control: string; criterion: string; severity: string; fix: string; effort: string; cost: string }[] = []
  if (adminExposed) gaps.push({ control: 'Admin Panel Publicly Accessible', criterion: 'Security (CC6.3)', severity: 'Critical', fix: 'Restrict /admin to authenticated users + IP allowlist', effort: '1 day', cost: '$0' })
  if (wpAdminExposed) gaps.push({ control: 'WordPress Admin Exposed', criterion: 'Security (CC6.3)', severity: 'Critical', fix: 'Restrict /wp-admin, enforce 2FA', effort: '1 day', cost: '$0' })
  if (!csp) gaps.push({ control: 'No Content Security Policy', criterion: 'Security (CC6.6)', severity: 'High', fix: 'Add Content-Security-Policy header via Next.js config or reverse proxy', effort: '2-4 hours', cost: '$0' })
  if (!hstsStrong) gaps.push({ control: 'HSTS Not Strong Enough', criterion: 'Security (CC6.7)', severity: 'High', fix: 'Set Strict-Transport-Security: max-age=63072000; includeSubDomains; preload', effort: '1 hour', cost: '$0' })
  if (!spfFound) gaps.push({ control: 'No SPF Record', criterion: 'Security (CC6.1)', severity: 'High', fix: `Add SPF TXT record to ${hostname} DNS: v=spf1 include:your-provider ~all`, effort: '30 mins', cost: '$0' })
  if (!dkimFound) gaps.push({ control: 'No DKIM Signing', criterion: 'Security (CC6.1)', severity: 'High', fix: `Enable DKIM in ${emailProvider} and publish the DNS key`, effort: '1-2 hours', cost: '$0' })
  if (!dmarcFound) gaps.push({ control: 'No DMARC Policy', criterion: 'Security (CC6.1)', severity: 'High', fix: `Add _dmarc.${hostname} TXT: v=DMARC1; p=quarantine; rua=mailto:dmarc@${hostname}`, effort: '30 mins', cost: '$0' })
  if (dmarcFound && dmarcPolicy === 'none') gaps.push({ control: 'DMARC Not Enforced', criterion: 'Security (CC6.1)', severity: 'Medium', fix: 'Change DMARC policy from p=none to p=quarantine or p=reject', effort: '15 mins', cost: '$0' })
  if (!xFrame) gaps.push({ control: 'No Clickjacking Protection', criterion: 'Security (CC6.6)', severity: 'High', fix: 'Add X-Frame-Options: SAMEORIGIN header', effort: '1 hour', cost: '$0' })
  if (!xContentType) gaps.push({ control: 'No MIME Sniffing Protection', criterion: 'Security (CC6.6)', severity: 'Medium', fix: 'Add X-Content-Type-Options: nosniff header', effort: '1 hour', cost: '$0' })
  if (!permissionsPolicy) gaps.push({ control: 'No Permissions Policy', criterion: 'Security (CC6.6)', severity: 'Medium', fix: 'Add Permissions-Policy header to restrict camera/mic/geolocation', effort: '1 hour', cost: '$0' })
  if (!referrerPolicy) gaps.push({ control: 'No Referrer Policy', criterion: 'Privacy (P6)', severity: 'Medium', fix: 'Add Referrer-Policy: strict-origin-when-cross-origin', effort: '1 hour', cost: '$0' })
  if (!hasSecurityTxt) gaps.push({ control: 'No Security.txt', criterion: 'Security (CC2.2)', severity: 'Low', fix: 'Add /.well-known/security.txt with Contact and Expires fields', effort: '30 mins', cost: '$0' })
  if (!hasBugBounty) gaps.push({ control: 'No Vulnerability Disclosure Policy', criterion: 'Security (CC2.2)', severity: 'Medium', fix: 'Publish a responsible disclosure policy page', effort: '1 day', cost: '$0' })
  if (!hasStatusPage) gaps.push({ control: 'No Status Page', criterion: 'Availability (A1.2)', severity: 'Medium', fix: 'Set up status.yourdomain.com using Betterstack, Statuspage, or Freshping', effort: '2 hours', cost: '$0-29/mo' })
  if (!hasSubprocessorList) gaps.push({ control: 'No Subprocessor List', criterion: 'Privacy (P6.1)', severity: 'High', fix: 'List all third-party data processors in your privacy policy (GDPR Art. 28)', effort: '1 day', cost: '$0' })
  if (!hasDSAR) gaps.push({ control: 'No DSAR Process', criterion: 'Privacy (P8.1)', severity: 'High', fix: 'Add a data subject access request email or form to your privacy policy', effort: '2 hours', cost: '$0' })
  if (!hasDataRetentionPolicy) gaps.push({ control: 'No Data Retention Policy', criterion: 'Privacy (P4.2)', severity: 'Medium', fix: 'Document how long you retain user data and add it to your privacy policy', effort: '1 day', cost: '$0' })
  if (!hasPrivacyContact) gaps.push({ control: 'No Privacy Contact', criterion: 'Privacy (P1.1)', severity: 'Medium', fix: 'Add privacy@ or DPO contact email to privacy policy', effort: '30 mins', cost: '$0' })
  if (!hasEncryptionMention) gaps.push({ control: 'Encryption Not Documented', criterion: 'Confidentiality (C1.2)', severity: 'Medium', fix: 'Add encryption-at-rest and in-transit statement to privacy policy', effort: '2 hours', cost: '$0' })

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
    user_id: user.id,
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

  if (error) {
    console.error('SOC scan save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: scan.id,
    url,
    hostname,
    overall_score: overallScore,
    readiness_level: readinessLevel,
    scores: { security: securityScore, availability: availabilityScore, confidentiality: confidentialityScore, privacy: privacyScore, integrity: integrityScore },
    gaps_count: gaps.length,
    critical_gaps: gaps.filter(g => g.severity === 'Critical').length,
    high_gaps: gaps.filter(g => g.severity === 'High').length,
    evidence,
    gaps,
  })
}

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
