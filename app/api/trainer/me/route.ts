import { NextResponse } from "next/server";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { todayInGymTimezone, dayOfWeekForDateString, addDays } from "@/lib/dateUtils";

type ClassRow = {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type BookingRow = {
  class_id: string;
  class_date: string;
  status: string;
};

// JSON twin of app/trainer/page.tsx — same queries, same auth guard.
export async function GET() {
  const trainer = await getSessionTrainer();
  if (!trainer) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const supabase = getSupabaseServer();
  const today = todayInGymTimezone();
  const todayDow = dayOfWeekForDateString(today);
  const offsetFromMonday = (todayDow + 6) % 7;
  const weekStart = addDays(today, -offsetFromMonday);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, day_of_week, start_time, end_time")
    .eq("trainer_id", trainer.id)
    .eq("active", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  const sessions = ((classes as ClassRow[]) || []).map((c) => ({
    ...c,
    date: addDays(weekStart, (c.day_of_week + 6) % 7),
  }));

  const classIds = sessions.map((s) => s.id);
  const { data: bookings } = classIds.length
    ? await supabase
        .from("class_bookings")
        .select("class_id, class_date, status")
        .in("class_id", classIds)
        .in("class_date", sessions.map((s) => s.date))
        .neq("status", "cancelled")
    : { data: [] };

  const sessionsWithCounts = sessions.map((s) => ({
    ...s,
    booking_count: ((bookings as BookingRow[] | null) || []).filter((b) => b.class_id === s.id && b.class_date === s.date).length,
  }));

  return NextResponse.json({
    ok: true,
    trainer: { name: trainer.name },
    today,
    sessions: sessionsWithCounts,
  });
}
