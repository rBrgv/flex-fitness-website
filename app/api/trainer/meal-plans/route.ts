import { NextRequest, NextResponse } from "next/server";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

type MealItemInput = {
  meal_type: string;
  name: string;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fats_g?: number | null;
  notes?: string | null;
};

export async function POST(req: NextRequest) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { title, goal_type, notes, items } = await req.json();
  if (!title || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "title and at least one item are required." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: plan, error: planError } = await supabase
    .from("meal_plans")
    .insert({ title, goal_type: goal_type || null, notes: notes || null, created_by_trainer_id: trainer.id })
    .select()
    .single();
  if (planError || !plan) {
    return NextResponse.json({ ok: false, error: "Could not create the template." }, { status: 500 });
  }

  const rows = (items as MealItemInput[]).map((item, index) => ({
    meal_plan_id: plan.id,
    meal_type: item.meal_type,
    name: item.name,
    calories: item.calories ?? null,
    protein_g: item.protein_g ?? null,
    carbs_g: item.carbs_g ?? null,
    fats_g: item.fats_g ?? null,
    notes: item.notes || null,
    order_index: index,
  }));

  const { error: itemsError } = await supabase.from("meal_plan_items").insert(rows);
  if (itemsError) {
    // Roll back the orphaned plan — no template with zero items.
    await supabase.from("meal_plans").delete().eq("id", plan.id);
    return NextResponse.json({ ok: false, error: "Could not save the meal items." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: plan.id });
}
