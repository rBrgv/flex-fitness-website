import { redirect } from "next/navigation";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { todayInGymTimezone } from "@/lib/dateUtils";
import { computeStreaks } from "@/lib/streak";
import { PortalDashboard } from "@/components/PortalDashboard";

export default async function PortalPage() {
  const member = await getSessionMember();
  if (!member) redirect("/portal/login");

  const supabase = getSupabaseServer();
  const today = todayInGymTimezone();

  const [{ data: trainer }, { data: bookings }, { data: attendance }] = await Promise.all([
    member.trainer_id
      ? supabase.from("trainers").select("name").eq("id", member.trainer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("class_bookings")
      .select("id, class_date, classes(name, start_time, end_time)")
      .eq("member_id", member.id)
      .gte("class_date", today)
      .order("class_date", { ascending: true }),
    supabase
      .from("attendance")
      .select("checked_in_at")
      .eq("member_id", member.id)
      .order("checked_in_at", { ascending: false })
      .limit(400),
  ]);

  const streak = computeStreaks((attendance || []).map((a) => a.checked_in_at));

  return (
    <PortalDashboard
      streak={streak}
      member={{
        name: member.name,
        phone: member.phone,
        status: member.status,
        membership_plan: member.membership_plan,
        plan_start_date: member.plan_start_date,
        plan_end_date: member.plan_end_date,
        trainer_name: (trainer as { name: string } | null)?.name || null,
      }}
      bookings={(bookings || []).map((b) => ({
        id: b.id as string,
        class_date: b.class_date as string,
        classes: Array.isArray(b.classes) ? b.classes[0] || null : b.classes,
      }))}
      attendance={(attendance || []).slice(0, 10)}
    />
  );
}
