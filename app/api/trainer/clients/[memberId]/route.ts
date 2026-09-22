import { NextResponse } from "next/server";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

type AssignmentRow = {
  id: string;
  start_date: string;
  end_date: string | null;
  meal_plans: {
    id: string;
    title: string;
    goal_type: string | null;
    meal_plan_items: {
      meal_type: string;
      name: string;
      calories: number | null;
      protein_g: number | null;
      carbs_g: number | null;
      fats_g: number | null;
    }[];
  } | null;
};

type WorkoutAssignmentRow = {
  id: string;
  start_date: string;
  end_date: string | null;
  workout_plans: {
    id: string;
    title: string;
    goal_type: string | null;
    workout_plan_exercises: {
      day_label: string;
      name: string;
      sets: number | null;
      reps: string | null;
      rest_seconds: number | null;
    }[];
  } | null;
};

// JSON twin of app/trainer/clients/[memberId]/page.tsx — same queries,
// same ownership check, same auth guard.
export async function GET(_req: Request, { params }: { params: Promise<{ memberId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { memberId } = await params;
  const supabase = getSupabaseServer();

  const { data: member } = await supabase
    .from("members")
    .select("id, name, phone, status, trainer_id")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || member.trainer_id !== trainer.id) {
    return NextResponse.json({ ok: false, error: "Not your client." }, { status: 403 });
  }

  const [{ data: assignment }, { data: templates }, { data: workoutAssignment }, { data: workoutTemplates }, { data: logs }, { data: photos }] = await Promise.all([
    supabase
      .from("member_meal_plan_assignments")
      .select("id, start_date, end_date, meal_plans(id, title, goal_type, meal_plan_items(meal_type, name, calories, protein_g, carbs_g, fats_g))")
      .eq("member_id", memberId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("meal_plans").select("id, title").order("title", { ascending: true }),
    supabase
      .from("member_workout_plan_assignments")
      .select("id, start_date, end_date, workout_plans(id, title, goal_type, workout_plan_exercises(day_label, name, sets, reps, rest_seconds))")
      .eq("member_id", memberId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("workout_plans").select("id, title").order("title", { ascending: true }),
    supabase
      .from("progress_logs")
      .select("*")
      .eq("member_id", memberId)
      .order("log_date", { ascending: false })
      .limit(20),
    supabase
      .from("progress_photos")
      .select("id, storage_path, log_date, view_type, is_milestone, notes")
      .eq("member_id", memberId)
      .order("log_date", { ascending: false })
      .limit(20),
  ]);

  let signedPhotos: { id: string; url: string; log_date: string; view_type: string; is_milestone: boolean }[] = [];
  if (photos && photos.length > 0) {
    const { data: signed } = await supabase.storage
      .from("progress-photos")
      .createSignedUrls(photos.map((p) => p.storage_path), 3600);
    signedPhotos = photos.map((p, i) => ({
      id: p.id,
      url: signed?.[i]?.signedUrl || "",
      log_date: p.log_date,
      view_type: p.view_type,
      is_milestone: p.is_milestone,
    }));
  }

  const activeAssignment = assignment as AssignmentRow | null;
  const activeWorkoutAssignment = workoutAssignment as WorkoutAssignmentRow | null;

  return NextResponse.json({
    ok: true,
    member: { id: member.id, name: member.name, phone: member.phone, status: member.status },
    active_assignment: activeAssignment
      ? { id: activeAssignment.id, start_date: activeAssignment.start_date, end_date: activeAssignment.end_date, plan: activeAssignment.meal_plans }
      : null,
    templates: templates || [],
    active_workout_assignment: activeWorkoutAssignment
      ? { id: activeWorkoutAssignment.id, start_date: activeWorkoutAssignment.start_date, end_date: activeWorkoutAssignment.end_date, plan: activeWorkoutAssignment.workout_plans }
      : null,
    workout_templates: workoutTemplates || [],
    logs: logs || [],
    photos: signedPhotos,
  });
}
