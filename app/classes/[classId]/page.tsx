import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { AmbientGlow } from "@/components/AmbientGlow";
import { SITE } from "@/lib/content";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const revalidate = 3600;

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
  description: string | null;
  active: boolean;
  trainers: { name: string } | { name: string }[] | null;
};

async function getClass(classId: string): Promise<ClassRow | null> {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("classes")
      .select("id, name, day_of_week, start_time, end_time, description, active, trainers(name)")
      .eq("id", classId)
      .maybeSingle();
    return (data as ClassRow) || null;
  } catch {
    return null;
  }
}

function trainerName(row: ClassRow) {
  const t = row.trainers;
  if (!t) return null;
  return Array.isArray(t) ? t[0]?.name : t.name;
}

export async function generateMetadata({ params }: { params: Promise<{ classId: string }> }): Promise<Metadata> {
  const { classId } = await params;
  const cls = await getClass(classId);
  if (!cls) return { title: "Class | Flex Fitness" };
  return {
    title: `${cls.name} | Flex Fitness`,
    description: cls.description || `${cls.name} at Flex Fitness — ${DAY_NAMES[cls.day_of_week]}s at ${formatTime(cls.start_time)}.`,
  };
}

export default async function ClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const cls = await getClass(classId);
  if (!cls || !cls.active) notFound();

  const bookLink = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to book ${cls.name}`)}`;

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-panel py-20">
          <AmbientGlow side="left" />
          <div className="relative mx-auto max-w-2xl px-5 sm:px-6 lg:px-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
              {DAY_NAMES[cls.day_of_week]} · {formatTime(cls.start_time)}–{formatTime(cls.end_time)}
            </p>
            <h1 className="mb-4 text-wrap-balance font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
              {cls.name}
            </h1>
            {trainerName(cls) && <p className="mb-6 text-sm text-muted">With {trainerName(cls)}</p>}
            {cls.description && <p className="mb-8 text-base leading-relaxed text-ink/85">{cls.description}</p>}

            <a
              href={bookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-accent-dark"
            >
              <Icon name="whatsapp" className="h-4 w-4" />
              Book on WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
