import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { AmbientGlow } from "./AmbientGlow";
import { SectionHeading } from "./SectionHeading";
import { SITE } from "@/lib/content";
import { getSupabaseServer } from "@/lib/supabaseServer";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  trainers: { name: string } | { name: string }[] | null;
};

async function getSchedule(): Promise<ClassRow[]> {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("classes")
      .select("id, name, day_of_week, start_time, end_time, trainers(name)")
      .eq("active", true)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });
    return (data as ClassRow[]) || [];
  } catch {
    return [];
  }
}

function trainerName(row: ClassRow) {
  const t = row.trainers;
  if (!t) return null;
  return Array.isArray(t) ? t[0]?.name : t.name;
}

export async function ClassSchedule() {
  const classes = await getSchedule();
  if (classes.length === 0) return null;

  const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Monday-first

  return (
    <section id="schedule" className="relative overflow-hidden bg-panel py-20">
      <AmbientGlow side="left" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="This week"
          title="Class schedule"
          description="Real timings, straight from the front desk — no booking needed for group classes, just show up. Personal training and general gym access run all day."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {orderedDays.map((day, i) => {
            const dayClasses = classes.filter((c) => c.day_of_week === day);
            return (
              <Reveal key={day} delay={i * 0.05} y={12}>
                <div className="h-full rounded-xl border border-line bg-paper p-3">
                  <p className="mb-2 border-b border-line pb-2 text-xs font-bold uppercase tracking-wide text-muted">
                    <span className="sm:hidden">{DAY_SHORT[day]}</span>
                    <span className="hidden sm:inline">{DAY_NAMES[day]}</span>
                  </p>
                  {dayClasses.length === 0 ? (
                    <p className="text-xs text-muted/60">—</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {dayClasses.map((c) => (
                        <li key={c.id} className="rounded-lg bg-panel-raised p-2">
                          <p className="text-[11px] font-bold text-gold">{formatTime(c.start_time)}</p>
                          <p className="text-xs font-semibold leading-tight text-ink">{c.name}</p>
                          {trainerName(c) && <p className="mt-0.5 text-[11px] text-muted">{trainerName(c)}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.3}>
          <a
            href={SITE.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline"
          >
            <Icon name="whatsapp" className="h-4 w-4" />
            Ask about a class on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
