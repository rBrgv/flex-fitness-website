import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { todayInGymTimezone } from "@/lib/dateUtils";
import { MemberProgressTracker } from "@/components/MemberProgressTracker";

export default async function ProgressPage() {
  const member = await getSessionMember();
  if (!member) redirect("/portal/login");

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

  return (
    <main className="min-h-screen bg-paper px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-ink">My Progress</h1>
          <Link href="/portal" className="text-sm font-bold text-muted hover:text-ink">← Back</Link>
        </div>

        <MemberProgressTracker today={todayInGymTimezone()} logs={logs || []} photos={signedPhotos} />
      </div>
    </main>
  );
}
