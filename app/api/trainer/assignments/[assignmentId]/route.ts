import { NextRequest, NextResponse } from "next/server";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

type AssignmentRow = {
  id: string;
  members: { trainer_id: string | null } | { trainer_id: string | null }[] | null;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ assignmentId: string }> }) {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { assignmentId } = await params;
  const supabase = getSupabaseServer();

  const { data: assignment } = await supabase
    .from("member_meal_plan_assignments")
    .select("id, members(trainer_id)")
    .eq("id", assignmentId)
    .maybeSingle();

  const ownerTrainerId = assignment
    ? Array.isArray((assignment as AssignmentRow).members)
      ? ((assignment as AssignmentRow).members as { trainer_id: string | null }[])[0]?.trainer_id
      : ((assignment as AssignmentRow).members as { trainer_id: string | null } | null)?.trainer_id
    : null;

  if (!assignment || ownerTrainerId !== trainer.id) {
    return NextResponse.json({ ok: false, error: "Not your client." }, { status: 403 });
  }

  const { is_active, end_date } = await req.json();
  const patch: Record<string, unknown> = {};
  if (is_active !== undefined) patch.is_active = is_active;
  if (end_date !== undefined) patch.end_date = end_date;

  const { error } = await supabase.from("member_meal_plan_assignments").update(patch).eq("id", assignmentId);
  if (error) return NextResponse.json({ ok: false, error: "Could not update the assignment." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
