import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { TrainerLogoutButton } from "@/components/TrainerLogoutButton";

type PlanRow = {
  id: string;
  title: string;
  goal_type: string | null;
  created_at: string;
};

export default async function MealPlansPage() {
  const trainer = await getSessionTrainer();
  if (!trainer) redirect("/trainer/login");

  const supabase = getSupabaseServer();
  const { data: plans } = await supabase
    .from("meal_plans")
    .select("id, title, goal_type, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Meal Plan Templates</h1>
            <p className="text-sm text-muted">Shared across all trainers</p>
          </div>
          <TrainerLogoutButton />
        </div>

        <div className="mb-4 flex items-center justify-between text-sm">
          <Link href="/trainer" className="font-bold text-muted hover:text-ink">← Schedule</Link>
          <Link href="/trainer/meal-plans/new" className="rounded-lg bg-accent px-4 py-2 font-bold text-paper">
            + New template
          </Link>
        </div>

        {(plans as PlanRow[] | null)?.length ? (
          <div className="flex flex-col gap-3">
            {(plans as PlanRow[]).map((p) => (
              <Link
                key={p.id}
                href={`/trainer/meal-plans/${p.id}`}
                className="flex items-center justify-between rounded-lg border border-line bg-panel p-4 hover:border-accent"
              >
                <div>
                  <p className="text-base font-bold text-ink">{p.title}</p>
                  {p.goal_type && <p className="text-xs text-muted">{p.goal_type.replace("_", " ")}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
            No templates yet — create one to start assigning diet plans.
          </p>
        )}
      </div>
    </main>
  );
}
