import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { url, user_id } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // Check trial/subscription
  const { data: trial } = await supabase
    .from('trials')
    .select('*')
    .eq('user_id', user_id)
    .single()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user_id)
    .eq('status', 'active')
    .single()

  const now = new Date()
  const trialActive = trial && new Date(trial.ends_at) > now
  const hasLAM = sub?.plans?.lam_monitoring || sub?.plans?.lam_audits > 0

  if (!trialActive && !hasLAM) {
    return NextResponse.json({ error: 'LAM not included in your plan' }, { status: 403 })
  }

  // Create pending run in Supabase
  const { data: run } = await supabase
    .from('lam_runs')
    .insert({ url, user_id, status: 'pending', triggered_by: 'dashboard' })
    .select()
    .single()

  // Trigger GitHub Action
  const ghRes = await fetch(
    `https://api.github.com/repos/vikramprv-blip/klaro/actions/workflows/pulse.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          target_url: url,
          scan_mode: 'lam'
        }
      })
    }
  )

  if (!ghRes.ok) {
    const err = await ghRes.text()
    return NextResponse.json({ error: `GitHub Action failed: ${err}` }, { status: 500 })
  }

  return NextResponse.json({ run_id: run.id, status: 'pending', message: 'LAM audit started' })
}
