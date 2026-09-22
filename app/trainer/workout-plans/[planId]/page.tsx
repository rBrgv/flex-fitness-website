import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { WorkoutPlanEditor } from "@/components/WorkoutPlanEditor";

export default async function EditWorkoutPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) redirect("/trainer/login");

  const { planId } = await params;
  const supabase = getSupabaseServer();

  const { data: plan } = await supabase.from("workout_plans").select("*").eq("id", planId).maybeSingle();
  if (!plan) notFound();

  const { data: exercises } = await supabase
    .from("workout_plan_exercises")
    .select("day_label, name, sets, reps, rest_seconds, notes")
    .eq("workout_plan_id", planId)
    .order("order_index", { ascending: true });

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Edit Workout Plan Template</h1>
          <p className="mb-2 text-sm">
            <Link href="/trainer/workout-plans" className="font-bold text-muted hover:text-ink">← Templates</Link>
          </p>
        </div>
        <WorkoutPlanEditor plan={plan} exercises={exercises || []} />
      </div>
    </main>
  );
}
