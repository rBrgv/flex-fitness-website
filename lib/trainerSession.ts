import { cookies } from "next/headers";
import { getSupabaseServer } from "./supabaseServer";

// Resolves the logged-in trainer from the flex_trainer_session cookie,
// server-side only — same shape as getSessionMember(), a separate cookie
// name so trainer and member sessions never overlap. Returns null if
// there's no session, it's expired, or the trainer row was removed.
export async function getSessionTrainer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("flex_trainer_session")?.value;
  if (!token) return null;

  const supabase = getSupabaseServer();
  const { data: session } = await supabase
    .from("trainer_sessions")
    .select("trainer_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!session || new Date(session.expires_at) < new Date()) return null;

  const { data: trainer } = await supabase.from("trainers").select("*").eq("id", session.trainer_id).maybeSingle();
  return trainer || null;
}
