import { NextResponse } from "next/server";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

// JSON twin of app/trainer/clients/page.tsx — same query, same auth guard.
export async function GET() {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const supabase = getSupabaseServer();
  const { data: members } = await supabase
    .from("members")
    .select("id, name, phone, status")
    .eq("trainer_id", trainer.id)
    .order("name", { ascending: true });

  return NextResponse.json({ ok: true, members: members || [] });
}
