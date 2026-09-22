import { getSupabaseServer } from "./supabaseServer";

const BOOKABLE_MEMBER_STATUSES = ["active"];

type Member = { id: string; status: string };

// Mirrors flex-fitness-whatsapp-bot/lib/freezeTools.js's requestFreeze —
// same rules, member comes from the verified session instead of a phone
// lookup. No WhatsApp send here: a Supabase Database Webhook on
// freeze_requests INSERT notifies the owner, source-agnostic (WhatsApp,
// website, or app all go through the same webhook exactly once).
export async function requestFreeze(member: Member, reason: string | null) {
  if (!BOOKABLE_MEMBER_STATUSES.includes(member.status)) {
    return { error: "not_active", message: `Membership status is '${member.status}', not active.` };
  }

  const supabase = getSupabaseServer();
  const { error: insertError } = await supabase
    .from("freeze_requests")
    .insert({ member_id: member.id, reason: reason || null });
  if (insertError) return { error: "insert_failed", message: insertError.message };

  return { success: true };
}
