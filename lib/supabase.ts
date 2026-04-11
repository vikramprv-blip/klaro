import { createClient } from "@supabase/supabase-js"

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://placeholder.supabase.co"
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder"

// Singleton pattern — prevents multiple GoTrueClient instances
const globalForSupabase = globalThis as unknown as {
  _supabase: ReturnType<typeof createClient> | undefined
  _supabaseAdmin: ReturnType<typeof createClient> | undefined
}

export const supabase = globalForSupabase._supabase ?? createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "klaro-auth",
  }
})

export const supabaseAdmin = globalForSupabase._supabaseAdmin ?? createClient(url, svc, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

if (process.env.NODE_ENV !== "production") {
  globalForSupabase._supabase = supabase
  globalForSupabase._supabaseAdmin = supabaseAdmin
}
