import { getSupabaseServer } from "./supabaseServer";

// Fail-open — a config outage should never silently disable a live
// feature. Same philosophy as the bot's lib/config.js getFeatureToggle,
// just without the in-memory cache (serverless functions here don't
// share memory between invocations, so a cache would rarely hit anyway).
export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from("feature_toggles").select("enabled").eq("key", key).maybeSingle();
    return error || !data ? true : data.enabled;
  } catch {
    return true;
  }
}
