import { cookies } from "next/headers";
import { getSupabaseServer } from "./supabaseServer";

// Resolves the logged-in member from the flex_session cookie, server-side
// only. Returns null if there's no session, it's expired, or the member
// row was removed. Callers (API routes, server components) treat null as
// "not logged in."
export async function getSessionMember() {
  const cookieStore = await cookies();
  const token = cookieStore.get("flex_session")?.value;
  if (!token) return null;

  const supabase = getSupabaseServer();
  const { data: session } = await supabase
    .from("member_sessions")
    .select("member_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!session || new Date(session.expires_at) < new Date()) return null;

  const { data: member } = await supabase.from("members").select("*").eq("id", session.member_id).maybeSingle();
  return member || null;
}
