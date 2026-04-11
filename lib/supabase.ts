import { createClient } from "@supabase/supabase-js"

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://placeholder.supabase.co"
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder"

// Single shared client instance — prevents multiple GoTrueClient warning
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient> | undefined
  supabaseAdmin: ReturnType<typeof createClient> | undefined
}

export const supabase = globalForSupabase.supabase ?? createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})

export const supabaseAdmin = globalForSupabase.supabaseAdmin ?? createClient(url, svc, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase
  globalForSupabase.supabaseAdmin = supabaseAdmin
}
