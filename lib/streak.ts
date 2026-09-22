import { todayInGymTimezone, addDays, dateInGymTimezone, daysBetween } from "./dateUtils";

export type Streak = { current: number; longest: number };

// Computes attendance streaks from raw checked_in_at timestamps (any
// order, any duplicates within a day — both are normalized here). A
// "day" is a gym-timezone calendar day, matching how check-in itself
// dedupes to one row per member per day (lib/attendance check-in route).
// Shared by /api/portal/me (for the app) and app/portal/page.tsx (for
// the website) so the two surfaces can never disagree.
export function computeStreaks(checkinTimestamps: string[]): Streak {
  const distinctDatesDesc = Array.from(new Set(checkinTimestamps.map((t) => dateInGymTimezone(t)))).sort((a, b) =>
    b.localeCompare(a)
  );
  if (distinctDatesDesc.length === 0) return { current: 0, longest: 0 };

  const today = todayInGymTimezone();
  const yesterday = addDays(today, -1);

  let current = 0;
  if (distinctDatesDesc[0] === today || distinctDatesDesc[0] === yesterday) {
    current = 1;
    for (let i = 0; i < distinctDatesDesc.length - 1; i++) {
      if (daysBetween(distinctDatesDesc[i + 1], distinctDatesDesc[i]) === 1) current++;
      else break;
    }
  }

  const asc = [...distinctDatesDesc].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < asc.length; i++) {
    if (daysBetween(asc[i - 1], asc[i]) === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return { current, longest };
}
