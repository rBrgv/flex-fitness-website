import { getSupabaseServer } from "./supabaseServer";
import { todayInGymTimezone, dayOfWeekForDateString, addDays } from "./dateUtils";
import { isFeatureEnabled } from "./featureToggles";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const BOOKABLE_MEMBER_STATUSES = ["active"];

type Member = { id: string; status: string };

type ClassRow = {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
};

export type BookableClass = {
  class_id: string;
  name: string;
  day: string;
  date: string;
  start_time: string;
  end_time: string;
  spots_left: number;
  already_booked: boolean;
};

function nextOccurrences(dayOfWeek: number, count = 7) {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const dateStr = todayInGymTimezone(i);
    if (dayOfWeekForDateString(dateStr) === dayOfWeek) dates.push(dateStr);
  }
  return dates;
}

// Mirrors flex-fitness-whatsapp-bot/lib/bookingTools.js's listUpcomingClasses
// — same capacity math, same 7-day window — this is the shared
// implementation both the website page and the Flutter app read through
// the /api/portal/classes route.
export async function listBookableClasses(member: Member): Promise<{ enabled: boolean; classes: BookableClass[] }> {
  const enabled = await isFeatureEnabled("class_booking");
  if (!enabled) return { enabled: false, classes: [] };

  const supabase = getSupabaseServer();
  const { data: classes } = await supabase.from("classes").select("*").eq("active", true);
  if (!classes) return { enabled, classes: [] };

  const { data: myBookings } = await supabase
    .from("class_bookings")
    .select("class_id, class_date")
    .eq("member_id", member.id)
    .gte("class_date", todayInGymTimezone());
  const myBookingKeys = new Set((myBookings || []).map((b) => `${b.class_id}:${b.class_date}`));

  const results: BookableClass[] = [];
  for (const c of classes as ClassRow[]) {
    for (const date of nextOccurrences(c.day_of_week, 7)) {
      const { count } = await supabase
        .from("class_bookings")
        .select("id", { count: "exact", head: true })
        .eq("class_id", c.id)
        .eq("class_date", date);
      const spotsLeft = c.capacity - (count || 0);
      const alreadyBooked = myBookingKeys.has(`${c.id}:${date}`);
      if (spotsLeft > 0 || alreadyBooked) {
        results.push({
          class_id: c.id,
          name: c.name,
          day: DAY_NAMES[c.day_of_week],
          date,
          start_time: c.start_time,
          end_time: c.end_time,
          spots_left: spotsLeft,
          already_booked: alreadyBooked,
        });
      }
    }
  }
  results.sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
  return { enabled, classes: results.slice(0, 40) };
}

// Mirrors bookClassForMember — same rules, member comes from the
// verified session instead of a phone lookup.
export async function bookClass(member: Member, classId: string, date: string) {
  if (!(await isFeatureEnabled("class_booking"))) {
    return { error: "feature_disabled", message: "Class booking is temporarily unavailable." };
  }
  if (!BOOKABLE_MEMBER_STATUSES.includes(member.status)) {
    return { error: "not_active", message: `Membership status is '${member.status}', not active.` };
  }

  const supabase = getSupabaseServer();
  const { data: cls } = await supabase.from("classes").select("*").eq("id", classId).eq("active", true).maybeSingle();
  if (!cls) return { error: "class_not_found", message: "That class does not exist or is no longer active." };

  const { count } = await supabase
    .from("class_bookings")
    .select("id", { count: "exact", head: true })
    .eq("class_id", classId)
    .eq("class_date", date);
  if ((count || 0) >= cls.capacity) {
    return { error: "full", message: `${cls.name} on ${date} is already full.` };
  }

  const { error: insertError } = await supabase
    .from("class_bookings")
    .insert({ class_id: classId, member_id: member.id, class_date: date });
  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "already_booked", message: `Already booked into ${cls.name} on ${date}.` };
    }
    return { error: "insert_failed", message: insertError.message };
  }

  return { success: true, class_name: cls.name, date, start_time: cls.start_time, end_time: cls.end_time };
}

// Mirrors cancelBookingForMember — a real delete, matching what
// WhatsApp cancellation already does today (not a status flip).
export async function cancelClass(member: Member, classId: string, date: string) {
  if (!(await isFeatureEnabled("class_booking"))) {
    return { error: "feature_disabled", message: "Class booking is temporarily unavailable." };
  }

  const supabase = getSupabaseServer();
  const { data: existing } = await supabase
    .from("class_bookings")
    .select("id")
    .eq("class_id", classId)
    .eq("member_id", member.id)
    .eq("class_date", date)
    .maybeSingle();
  if (!existing) return { error: "not_booked", message: "No booking found for that class and date." };

  const { error: deleteError } = await supabase.from("class_bookings").delete().eq("id", existing.id);
  if (deleteError) return { error: "delete_failed", message: deleteError.message };

  return { success: true };
}
