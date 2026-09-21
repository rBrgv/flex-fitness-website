import { NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";

// JSON twin of app/portal/progress/page.tsx — same queries, same auth guard.
export async function GET() {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const supabase = getSupabaseServer();
  const [{ data: logs }, { data: photos }] = await Promise.all([
    supabase
      .from("progress_logs")
      .select("*")
      .eq("member_id", member.id)
      .order("log_date", { ascending: false })
      .limit(30),
    supabase
      .from("progress_photos")
      .select("id, storage_path, log_date, view_type, is_milestone, notes")
      .eq("member_id", member.id)
      .order("log_date", { ascending: false })
      .limit(30),
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

  return NextResponse.json({ ok: true, logs: logs || [], photos: signedPhotos });
}
