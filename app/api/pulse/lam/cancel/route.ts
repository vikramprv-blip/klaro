import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { run_id, gh_run_id } = await req.json()

  // Update Supabase status to cancelled
  if (run_id) {
    await supabase.from('lam_runs')
      .update({ status: 'cancelled', completed_at: new Date().toISOString() })
      .eq('id', run_id)
  }

  // Cancel GitHub Action if run ID provided
  if (gh_run_id && process.env.GITHUB_PAT) {
    const res = await fetch(
      `https://api.github.com/repos/vikramprv-blip/klaro-pulse/actions/runs/${gh_run_id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github+json'
        }
      }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'GitHub cancel failed', status: res.status }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, message: 'Scan cancelled' })
}
