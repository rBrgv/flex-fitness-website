import { NextRequest, NextResponse } from "next/server";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

type ExerciseInput = {
  day_label: string;
  name: string;
  sets?: number | null;
  reps?: string | null;
  rest_seconds?: number | null;
  notes?: string | null;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { planId } = await params;
  const { title, goal_type, notes, exercises } = await req.json();
  if (!title || !Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ ok: false, error: "title and at least one exercise are required." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { error: updateError } = await supabase
    .from("workout_plans")
    .update({ title, goal_type: goal_type || null, notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", planId);
  if (updateError) return NextResponse.json({ ok: false, error: "Could not update the template." }, { status: 500 });

  await supabase.from("workout_plan_exercises").delete().eq("workout_plan_id", planId);

  const rows = (exercises as ExerciseInput[]).map((ex, index) => ({
    workout_plan_id: planId,
    day_label: ex.day_label,
    name: ex.name,
    sets: ex.sets ?? null,
    reps: ex.reps || null,
    rest_seconds: ex.rest_seconds ?? null,
    notes: ex.notes || null,
    order_index: index,
  }));

  const { error: exercisesError } = await supabase.from("workout_plan_exercises").insert(rows);
  if (exercisesError) return NextResponse.json({ ok: false, error: "Could not save the exercises." }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { planId } = await params;
  const supabase = getSupabaseServer();

  const { error } = await supabase.from("workout_plans").delete().eq("id", planId);
  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        { ok: false, error: "This template is assigned to one or more members and can't be deleted." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: "Could not delete the template." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
