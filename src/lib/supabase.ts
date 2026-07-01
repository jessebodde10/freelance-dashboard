import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** False when the .env values are missing — the app shows a setup screen. */
export const isSupabaseConfigured = Boolean(url && anonKey)

// A single shared client. Null (not a broken client) when unconfigured, so
// callers can fail gracefully instead of crashing at import time.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/** Narrowing helper: returns the client or throws a clear error. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is niet geconfigureerd. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env.',
    )
  }
  return supabase
}
