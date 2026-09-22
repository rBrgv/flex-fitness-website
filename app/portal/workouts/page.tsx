import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { PortalNav } from "@/components/PortalNav";

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

function formatDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupByDay(exercises: Exercise[]) {
  const groups: Record<string, Exercise[]> = {};
  const order: string[] = [];
  for (const ex of exercises) {
    if (!groups[ex.day_label]) {
      groups[ex.day_label] = [];
      order.push(ex.day_label);
    }
    groups[ex.day_label].push(ex);
  }
  return order.map((day) => ({ day, exercises: groups[day] }));
}

export default async function WorkoutsPage() {
  const member = await getSessionMember();
  if (!member) redirect("/portal/login");

  const supabase = getSupabaseServer();
  const { data: assignment } = await supabase
    .from("member_workout_plan_assignments")
    .select("start_date, workout_plans(title, goal_type, workout_plan_exercises(day_label, name, sets, reps, rest_seconds, notes))")
    .eq("member_id", member.id)
    .eq("is_active", true)
    .maybeSingle();

  const row = assignment as AssignmentRow | null;
  const plan = row?.workout_plans ? (Array.isArray(row.workout_plans) ? row.workout_plans[0] : row.workout_plans) : null;

  return (
    <main className="min-h-screen bg-paper px-5 pb-28 pt-8 sm:px-8 sm:pb-32">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-ink">My Workout Plan</h1>
          <Link href="/portal" className="text-sm font-bold text-muted hover:text-ink">← Back</Link>
        </div>

        {plan ? (
          <>
            <div className="mb-6 rounded-2xl border border-line bg-panel p-6">
              <p className="mb-1 text-lg font-bold text-ink">{plan.title}</p>
              {row?.start_date && <p className="text-sm text-muted">Since {formatDate(row.start_date)}</p>}
            </div>

            <div className="flex flex-col gap-4">
              {groupByDay(plan.workout_plan_exercises).map((group) => (
                <div key={group.day} className="rounded-2xl border border-line bg-panel p-6">
                  <p className="mb-3 text-sm font-bold uppercase tracking-wide text-gold">{group.day}</p>
                  <ul className="flex flex-col gap-2">
                    {group.exercises.map((ex, i) => (
                      <li key={i} className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-ink">{ex.name}</span>
                        <span className="text-xs text-muted">
                          {[ex.sets && `${ex.sets} sets`, ex.reps && `${ex.reps} reps`].filter(Boolean).join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-line bg-panel p-6 text-sm text-muted">
            No workout plan assigned yet — check with your trainer.
          </p>
        )}
      </div>
      <PortalNav active="workouts" />
    </main>
  );
}
