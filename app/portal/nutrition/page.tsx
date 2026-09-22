import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { PortalNav } from "@/components/PortalNav";

type MealItem = {
  meal_type: string;
  name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
};

type AssignmentRow = {
  start_date: string;
  meal_plans: { title: string; goal_type: string | null; meal_plan_items: MealItem[] } | { title: string; goal_type: string | null; meal_plan_items: MealItem[] }[] | null;
};

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

function formatDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupByMeal(items: MealItem[]) {
  const groups: Record<string, MealItem[]> = {};
  for (const item of items) {
    (groups[item.meal_type] ||= []).push(item);
  }
  return MEAL_ORDER.filter((t) => groups[t]?.length).map((t) => ({ type: t, items: groups[t] }));
}

export default async function NutritionPage() {
  const member = await getSessionMember();
  if (!member) redirect("/portal/login");

  const supabase = getSupabaseServer();
  const { data: assignment } = await supabase
    .from("member_meal_plan_assignments")
    .select("start_date, meal_plans(title, goal_type, meal_plan_items(meal_type, name, calories, protein_g, carbs_g, fats_g))")
    .eq("member_id", member.id)
    .eq("is_active", true)
    .maybeSingle();

  const row = assignment as AssignmentRow | null;
  const plan = row?.meal_plans ? (Array.isArray(row.meal_plans) ? row.meal_plans[0] : row.meal_plans) : null;

  const totals = plan
    ? plan.meal_plan_items.reduce(
        (acc, i) => ({
          calories: acc.calories + (i.calories || 0),
          protein_g: acc.protein_g + (i.protein_g || 0),
          carbs_g: acc.carbs_g + (i.carbs_g || 0),
          fats_g: acc.fats_g + (i.fats_g || 0),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
      )
    : null;

  return (
    <main className="min-h-screen bg-paper px-5 pb-28 pt-8 sm:px-8 sm:pb-32">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-ink">My Diet Plan</h1>
          <Link href="/portal" className="text-sm font-bold text-muted hover:text-ink">← Back</Link>
        </div>

        {plan ? (
          <>
            <div className="mb-6 rounded-2xl border border-line bg-panel p-6">
              <p className="mb-1 text-lg font-bold text-ink">{plan.title}</p>
              {row?.start_date && <p className="mb-3 text-sm text-muted">Since {formatDate(row.start_date)}</p>}
              {totals && (
                <p className="text-sm text-muted">
                  Daily total: <span className="font-bold text-ink">{totals.calories} kcal</span>
                  {" · "}P {totals.protein_g}g · C {totals.carbs_g}g · F {totals.fats_g}g
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {groupByMeal(plan.meal_plan_items).map((group) => (
                <div key={group.type} className="rounded-2xl border border-line bg-panel p-6">
                  <p className="mb-3 text-sm font-bold uppercase tracking-wide text-gold">{group.type}</p>
                  <ul className="flex flex-col gap-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-ink">{item.name}</span>
                        {item.calories != null && <span className="text-xs text-muted">{item.calories} kcal</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-line bg-panel p-6 text-sm text-muted">
            No diet plan assigned yet — check with your trainer.
          </p>
        )}
      </div>
      <PortalNav active="nutrition" />
    </main>
  );
}
