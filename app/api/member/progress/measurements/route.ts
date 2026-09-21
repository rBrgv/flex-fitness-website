import { NextRequest, NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { todayInGymTimezone } from "@/lib/dateUtils";

export async function POST(req: NextRequest) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const body = await req.json();
  const {
    date,
    weight_kg,
    body_fat_percentage,
    waist_cm,
    chest_cm,
    arms_cm,
    thighs_cm,
    hips_cm,
    neck_cm,
    notes,
  } = body;

  const supabase = getSupabaseServer();
  const logDate = date || todayInGymTimezone();

  const { error } = await supabase.from("progress_logs").upsert(
    {
      member_id: member.id,
      log_date: logDate,
      weight_kg: weight_kg ?? null,
      body_fat_percentage: body_fat_percentage ?? null,
      waist_cm: waist_cm ?? null,
      chest_cm: chest_cm ?? null,
      arms_cm: arms_cm ?? null,
      thighs_cm: thighs_cm ?? null,
      hips_cm: hips_cm ?? null,
      neck_cm: neck_cm ?? null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "member_id,log_date" }
  );

  if (error) return NextResponse.json({ ok: false, error: "Could not save your entry." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
