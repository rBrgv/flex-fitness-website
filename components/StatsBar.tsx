import { SITE } from "@/lib/content";
import { AnimatedNumber } from "./AnimatedNumber";
import { Reveal } from "./Reveal";

const STATS = [
  { value: SITE.memberCount, label: "Members training with us" },
  { value: SITE.transformationCount, label: "Health transformations" },
  { value: "5", label: "Core programs under one roof" },
  { value: "7", label: "Days a week we're open" },
];

export function StatsBar() {
  return (
    <section className="border-y border-line bg-panel">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-5 py-8 sm:grid-cols-4 sm:divide-x sm:divide-line sm:gap-y-0 sm:px-6 sm:py-0 lg:px-8">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} y={16}>
            <div className="flex flex-col items-center gap-1 text-center sm:py-10">
              <span className="font-display text-4xl font-bold text-gold sm:text-5xl">
                <AnimatedNumber value={stat.value} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{stat.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
