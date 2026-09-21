import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { TrainerLogoutButton } from "@/components/TrainerLogoutButton";
import { TrainerClientDetail } from "@/components/TrainerClientDetail";

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

export default async function TrainerClientDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) redirect("/trainer/login");

  const { memberId } = await params;
  const supabase = getSupabaseServer();

  const { data: member } = await supabase
    .from("members")
    .select("id, name, phone, status, trainer_id")
    .eq("id", memberId)
    .maybeSingle();

  // Ownership check — a trainer may only view their own assigned members.
  if (!member || member.trainer_id !== trainer.id) notFound();

  const [{ data: assignment }, { data: templates }, { data: logs }, { data: photos }] = await Promise.all([
    supabase
      .from("member_meal_plan_assignments")
      .select("id, start_date, end_date, meal_plans(id, title, goal_type, meal_plan_items(meal_type, name, calories, protein_g, carbs_g, fats_g))")
      .eq("member_id", memberId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("meal_plans").select("id, title").order("title", { ascending: true }),
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

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">{member.name}</h1>
            <p className="text-sm text-muted">{member.phone}</p>
          </div>
          <TrainerLogoutButton />
        </div>

        <p className="mb-4 text-sm">
          <Link href="/trainer/clients" className="font-bold text-muted hover:text-ink">← My Clients</Link>
        </p>

        <TrainerClientDetail
          memberId={member.id}
          activeAssignment={
            activeAssignment
              ? {
                  id: activeAssignment.id,
                  start_date: activeAssignment.start_date,
                  end_date: activeAssignment.end_date,
                  plan: activeAssignment.meal_plans,
                }
              : null
          }
          templates={templates || []}
          logs={logs || []}
          photos={signedPhotos}
        />
      </div>
    </main>
  );
}
