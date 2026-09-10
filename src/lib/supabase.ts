import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * FlexiBook · Supabase client
 * ─────────────────────────────────────────────────────────────────
 * Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * When credentials are absent the app runs in local demo mode and
 * bookings are persisted in the browser (see lib/demoStore.ts).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when both Supabase credentials are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

/** Lazily-created singleton Supabase client (null in demo mode). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

/** Table that stores FlexiBook booking records. */
export const BOOKINGS_TABLE = "bookings";
