import { createClient } from "@supabase/supabase-js"

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? "https://placeholder.supabase.co"
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon"
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY     ?? "placeholder-service"

export const supabase      = createClient(url, anon, {
  auth: { persistSession: false }
})

export const supabaseAdmin = createClient(url, svc, {
  auth: { persistSession: false, autoRefreshToken: false }
})
