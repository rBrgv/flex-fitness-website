import { NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

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

// JSON twin of app/portal/nutrition/page.tsx — same query, same auth guard.
export async function GET() {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const supabase = getSupabaseServer();
  const { data: assignment } = await supabase
    .from("member_meal_plan_assignments")
    .select("start_date, meal_plans(title, goal_type, meal_plan_items(meal_type, name, calories, protein_g, carbs_g, fats_g))")
    .eq("member_id", member.id)
    .eq("is_active", true)
    .maybeSingle();

  const row = assignment as AssignmentRow | null;
  const plan = row?.meal_plans ? (Array.isArray(row.meal_plans) ? row.meal_plans[0] : row.meal_plans) : null;

  if (!plan) return NextResponse.json({ ok: true, plan: null });

  const totals = plan.meal_plan_items.reduce(
    (acc, i) => ({
      calories: acc.calories + (i.calories || 0),
      protein_g: acc.protein_g + (i.protein_g || 0),
      carbs_g: acc.carbs_g + (i.carbs_g || 0),
      fats_g: acc.fats_g + (i.fats_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
  );

  return NextResponse.json({
    ok: true,
    plan: { title: plan.title, goal_type: plan.goal_type, items: plan.meal_plan_items },
    start_date: row?.start_date,
    totals,
  });
}
