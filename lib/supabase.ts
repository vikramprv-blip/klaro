import { createClient } from "@supabase/supabase-js"

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://placeholder.supabase.co"
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder"

// Browser client — used for auth
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "klaro-auth",
  }
})

// Admin client — bypasses RLS, used for server-side inserts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = createClient<any>(url, svc, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})
