import { redirect } from "next/navigation";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { todayInGymTimezone, dayOfWeekForDateString, addDays } from "@/lib/dateUtils";
import { TrainerLogoutButton } from "@/components/TrainerLogoutButton";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

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
  members: { name: string; phone: string } | { name: string; phone: string }[] | null;
};

function bookedMember(b: BookingRow) {
  const m = b.members;
  if (!m) return null;
  return Array.isArray(m) ? m[0] || null : m;
}

export default async function TrainerSchedulePage() {
  const trainer = await getSessionTrainer();
  if (!trainer) redirect("/trainer/login");

  const supabase = getSupabaseServer();
  const today = todayInGymTimezone();

  // Monday of the current calendar week, regardless of which day "today" is.
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
        .select("class_id, class_date, status, members(name, phone)")
        .in("class_id", classIds)
        .in("class_date", sessions.map((s) => s.date))
        .neq("status", "cancelled")
    : { data: [] };

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Hi, {trainer.name}</h1>
            <p className="text-sm text-muted">Your schedule this week</p>
          </div>
          <TrainerLogoutButton />
        </div>

        {sessions.length === 0 ? (
          <p className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
            No classes assigned to you right now.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => {
              const sessionBookings = (bookings as BookingRow[] | null)?.filter(
                (b) => b.class_id === s.id && b.class_date === s.date
              ) || [];
              return (
                <div key={s.id} className="rounded-lg border border-line bg-panel p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    {DAY_NAMES[dayOfWeekForDateString(s.date)]}, {new Date(`${s.date}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <p className="mt-1 text-base font-bold text-ink">
                    {s.name} <span className="font-normal text-muted">— {formatTime(s.start_time)}–{formatTime(s.end_time)}</span>
                  </p>
                  <div className="mt-3 border-t border-line pt-3">
                    {sessionBookings.length === 0 ? (
                      <p className="text-xs italic text-muted">No bookings yet.</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {sessionBookings.map((b, i) => {
                          const member = bookedMember(b);
                          return (
                            <li key={i} className="text-sm text-ink">
                              {member?.name || "Unknown member"}
                              {b.status === "attended" && <span className="ml-2 text-xs text-green-500">Attended</span>}
                              {b.status === "no_show" && <span className="ml-2 text-xs text-red-400">No-show</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
