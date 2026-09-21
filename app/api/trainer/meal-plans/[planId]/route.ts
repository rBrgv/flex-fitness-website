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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { planId } = await params;
  const { title, goal_type, notes, items } = await req.json();
  if (!title || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "title and at least one item are required." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { error: updateError } = await supabase
    .from("meal_plans")
    .update({ title, goal_type: goal_type || null, notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", planId);
  if (updateError) return NextResponse.json({ ok: false, error: "Could not update the template." }, { status: 500 });

  // Full replace — simplest strategy for a form-based editor, no per-row diffing.
  await supabase.from("meal_plan_items").delete().eq("meal_plan_id", planId);

  const rows = (items as MealItemInput[]).map((item, index) => ({
    meal_plan_id: planId,
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
  if (itemsError) return NextResponse.json({ ok: false, error: "Could not save the meal items." }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { planId } = await params;
  const supabase = getSupabaseServer();

  const { error } = await supabase.from("meal_plans").delete().eq("id", planId);
  if (error) {
    // FK violation from member_meal_plan_assignments.meal_plan_id's ON DELETE RESTRICT.
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
