import { createClient } from "@supabase/supabase-js";

// Server-only — uses the service_role key, which bypasses RLS entirely.
// Never import this from a "use client" component or anything that ships
// to the browser bundle. Only used inside app/api/** route handlers.
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(url, key);
}
