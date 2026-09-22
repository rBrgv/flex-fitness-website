import { NextRequest, NextResponse } from "next/server";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { member_id, workout_plan_id, start_date, end_date, notes } = await req.json();
  if (!member_id || !workout_plan_id || !start_date) {
    return NextResponse.json({ ok: false, error: "member_id, workout_plan_id, and start_date are required." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: member } = await supabase.from("members").select("id, trainer_id").eq("id", member_id).maybeSingle();
  if (!member || member.trainer_id !== trainer.id) {
    return NextResponse.json({ ok: false, error: "Not your client." }, { status: 403 });
  }

  const { data: plan } = await supabase.from("workout_plans").select("id").eq("id", workout_plan_id).maybeSingle();
  if (!plan) return NextResponse.json({ ok: false, error: "Template not found." }, { status: 404 });

  await supabase
    .from("member_workout_plan_assignments")
    .update({ is_active: false })
    .eq("member_id", member_id)
    .eq("is_active", true);

  const { data: assignment, error } = await supabase
    .from("member_workout_plan_assignments")
    .insert({
      member_id,
      workout_plan_id,
      assigned_by_trainer_id: trainer.id,
      start_date,
      end_date: end_date || null,
      notes: notes || null,
      is_active: true,
    })
    .select()
    .single();

  if (error || !assignment) {
    return NextResponse.json({ ok: false, error: "Could not assign the plan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: assignment.id });
}
