import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { MealPlanEditor } from "@/components/MealPlanEditor";

export default async function EditMealPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) redirect("/trainer/login");

  const { planId } = await params;
  const supabase = getSupabaseServer();

  const { data: plan } = await supabase.from("meal_plans").select("*").eq("id", planId).maybeSingle();
  if (!plan) notFound();

  const { data: items } = await supabase
    .from("meal_plan_items")
    .select("meal_type, name, calories, protein_g, carbs_g, fats_g, notes")
    .eq("meal_plan_id", planId)
    .order("order_index", { ascending: true });

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Edit Meal Plan Template</h1>
          <p className="mb-2 text-sm">
            <Link href="/trainer/meal-plans" className="font-bold text-muted hover:text-ink">← Templates</Link>
          </p>
        </div>
        <MealPlanEditor plan={plan} items={items || []} />
      </div>
    </main>
  );
}
