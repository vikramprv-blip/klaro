import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runSOCScan } from '../route'

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function GET(req: Request) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[SOC Cron] Starting weekly rescan...')
  const results = { scanned: 0, failed: 0, skipped: 0, alerts: 0 }

  try {
    // Get all users who have had a SOC scan in the last 90 days
    const { data: recentScans } = await svc
      .from('soc_scans')
      .select('user_id, url, overall_score, created_at')
      .gte('scanned_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('scanned_at', { ascending: false })

    if (!recentScans || recentScans.length === 0) {
      return NextResponse.json({ message: 'No scans to rescan', ...results })
    }

    // Deduplicate — get latest scan per user+url combo
    const toRescan = new Map<string, { user_id: string; url: string; last_score: number }>()
    for (const scan of recentScans) {
      const key = `${scan.user_id}:${scan.url}`
      if (!toRescan.has(key)) {
        toRescan.set(key, { user_id: scan.user_id, url: scan.url, last_score: scan.overall_score || 0 })
      }
    }

    console.log(`[SOC Cron] Rescanning ${toRescan.size} unique site(s)...`)

    for (const [, { user_id, url, last_score }] of toRescan) {
      try {
        console.log(`[SOC Cron] Scanning ${url} for user ${user_id}...`)
        const result = await runSOCScan(url, user_id)

        if (!result) {
          results.failed++
          continue
        }

        results.scanned++

        // Alert if score dropped more than 10 points
        const scoreDrop = last_score - result.overall_score
        if (scoreDrop >= 10 || result.critical_gaps > 0) {
          results.alerts++
          // Log alert — in production, send email via Resend
          console.log(`[SOC Cron] ALERT: ${url} score dropped ${scoreDrop} points or has ${result.critical_gaps} critical gaps`)

          // Store alert in DB
          await svc.from('soc_scans').update({
            progress_message: `⚠ Score dropped ${scoreDrop} points since last scan`
          }).eq('id', result.id)
        }

        // Small delay between scans to avoid rate limits
        await new Promise(r => setTimeout(r, 3000))

      } catch (e) {
        console.error(`[SOC Cron] Failed to scan ${url}:`, e)
        results.failed++
      }
    }

    console.log(`[SOC Cron] Done. Scanned: ${results.scanned}, Failed: ${results.failed}, Alerts: ${results.alerts}`)
    return NextResponse.json({ success: true, ...results, timestamp: new Date().toISOString() })

  } catch (e: any) {
    console.error('[SOC Cron] Error:', e)
    return NextResponse.json({ error: e.message, ...results }, { status: 500 })
  }
}
