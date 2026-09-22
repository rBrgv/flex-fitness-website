import { NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

type Exercise = {
  day_label: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  notes: string | null;
};

type AssignmentRow = {
  start_date: string;
  workout_plans: { title: string; goal_type: string | null; workout_plan_exercises: Exercise[] } | { title: string; goal_type: string | null; workout_plan_exercises: Exercise[] }[] | null;
};

// JSON twin of app/portal/workouts/page.tsx — same query, same auth guard.
export async function GET() {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const supabase = getSupabaseServer();
  const { data: assignment } = await supabase
    .from("member_workout_plan_assignments")
    .select("start_date, workout_plans(title, goal_type, workout_plan_exercises(day_label, name, sets, reps, rest_seconds, notes))")
    .eq("member_id", member.id)
    .eq("is_active", true)
    .maybeSingle();

  const row = assignment as AssignmentRow | null;
  const plan = row?.workout_plans ? (Array.isArray(row.workout_plans) ? row.workout_plans[0] : row.workout_plans) : null;

  if (!plan) return NextResponse.json({ ok: true, plan: null });

  return NextResponse.json({
    ok: true,
    plan: { title: plan.title, goal_type: plan.goal_type, exercises: plan.workout_plan_exercises },
    start_date: row?.start_date,
  });
}
