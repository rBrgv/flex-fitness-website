// The gym is in India regardless of where this runs (Vercel's serverless
// functions default to UTC). Using new Date().toISOString() for "today"
// would silently return yesterday's date during the ~5.5hr window each day
// where IST has rolled to a new calendar day but UTC hasn't yet — exactly
// the gym's early-morning opening hours. Always resolve "today" via the
// gym's actual timezone instead of the server's. (Same bug, same fix, as
// the WhatsApp bot's lib/dateUtils.js — kept in sync manually since these
// are two separate repos.)
const GYM_TIMEZONE = "Asia/Kolkata";

export function todayInGymTimezone(offsetDays = 0): string {
  const instant = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: GYM_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    instant
  );
}

// Parsing a date-only string as UTC noon (not local midnight, not UTC
// midnight) sidesteps any timezone rollover when reading back the day index
// or doing date arithmetic. Same idiom as the bot's lib/dateUtils.js.
export function dayOfWeekForDateString(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
