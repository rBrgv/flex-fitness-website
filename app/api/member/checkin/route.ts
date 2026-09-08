import { NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { todayInGymTimezone } from "@/lib/dateUtils";

// QR/self check-in — the interim attendance source until the ESSL
// biometric integration is wired up (members.biometric_id is reserved
// for that). Deduped to one check-in per member per day.
export async function POST() {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const supabase = getSupabaseServer();
  const today = todayInGymTimezone();

  // Explicit +05:30 offset — NOT "Z" (UTC) — so this actually bounds the
  // IST calendar day, not a UTC day that's offset from it.
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("member_id", member.id)
    .gte("checked_in_at", `${today}T00:00:00+05:30`)
    .lte("checked_in_at", `${today}T23:59:59+05:30`)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, alreadyCheckedIn: true });
  }

  const { error } = await supabase.from("attendance").insert({ member_id: member.id, source: "qr" });
  if (error) return NextResponse.json({ ok: false, error: "Could not check you in — please try again." }, { status: 500 });

  return NextResponse.json({ ok: true, alreadyCheckedIn: false });
}
