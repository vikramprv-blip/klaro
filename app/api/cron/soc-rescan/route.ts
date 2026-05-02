import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runSOCScan } from '@/lib/soc/scanner'

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { scanned: 0, failed: 0, alerts: 0 }

  const { data: recentScans } = await svc
    .from('soc_scans')
    .select('user_id, url, overall_score')
    .gte('scanned_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .order('scanned_at', { ascending: false })

  if (!recentScans?.length) return NextResponse.json({ message: 'Nothing to rescan', ...results })

  const toRescan = new Map<string, { user_id: string; url: string; last_score: number }>()
  for (const s of recentScans) {
    const key = `${s.user_id}:${s.url}`
    if (!toRescan.has(key)) toRescan.set(key, { user_id: s.user_id, url: s.url, last_score: s.overall_score || 0 })
  }

  for (const [, { user_id, url, last_score }] of toRescan) {
    try {
      const result = await runSOCScan(url, user_id)
      if (!result) { results.failed++; continue }
      results.scanned++
      if ((last_score - result.overall_score) >= 10 || result.critical_gaps > 0) results.alerts++
      await new Promise(r => setTimeout(r, 3000))
    } catch { results.failed++ }
  }

  return NextResponse.json({ success: true, ...results })
}
