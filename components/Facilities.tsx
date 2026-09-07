import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { AmbientGlow } from "./AmbientGlow";
import { SectionHeading } from "./SectionHeading";
import { FACILITIES, SITE } from "@/lib/content";

export function Facilities() {
  return (
    <section id="facilities" className="relative overflow-hidden bg-panel py-20">
      <AmbientGlow side="right" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
        <SectionHeading
          className=""
          eyebrow={`Why ${SITE.name}`}
          title="A gym built around showing up"
          description={`${SITE.memberCount} members and ${SITE.transformationCount} health transformations in ${SITE.neighborhood} — from first-timers to long-time regulars who bring their friends through our referral program.`}
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {FACILITIES.map((item, i) => (
            <Reveal
              key={item}
              as="li"
              delay={i * 0.06}
              y={12}
              className="group flex h-full items-start gap-3 rounded-xl border border-line bg-paper p-4 transition-colors duration-300 hover:border-accent/40"
            >
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent text-paper transition-transform duration-300 group-hover:scale-110">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium text-ink">{item}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
