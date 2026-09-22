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

export async function POST(req: NextRequest) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { title, goal_type, notes, exercises } = await req.json();
  if (!title || !Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ ok: false, error: "title and at least one exercise are required." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert({ title, goal_type: goal_type || null, notes: notes || null, created_by_trainer_id: trainer.id })
    .select()
    .single();
  if (planError || !plan) {
    return NextResponse.json({ ok: false, error: "Could not create the template." }, { status: 500 });
  }

  const rows = (exercises as ExerciseInput[]).map((ex, index) => ({
    workout_plan_id: plan.id,
    day_label: ex.day_label,
    name: ex.name,
    sets: ex.sets ?? null,
    reps: ex.reps || null,
    rest_seconds: ex.rest_seconds ?? null,
    notes: ex.notes || null,
    order_index: index,
  }));

  const { error: exercisesError } = await supabase.from("workout_plan_exercises").insert(rows);
  if (exercisesError) {
    await supabase.from("workout_plans").delete().eq("id", plan.id);
    return NextResponse.json({ ok: false, error: "Could not save the exercises." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: plan.id });
}
