import { Reveal } from "./Reveal";
import { AmbientGlow } from "./AmbientGlow";
import { SectionHeading } from "./SectionHeading";
import { TESTIMONIALS, GOOGLE_RATING, SITE } from "@/lib/content";

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-panel py-20">
      <AmbientGlow side="left" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Members"
          title="What people are saying"
          description={`${GOOGLE_RATING.score}★ from ${GOOGLE_RATING.count} Google reviews — real member reviews, not marketing copy.`}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="relative h-full overflow-hidden rounded-2xl border border-line bg-paper p-6 transition-colors duration-300 hover:border-accent/40">
                <span aria-hidden="true" className="absolute right-4 top-2 font-display text-6xl text-accent/10">
                  &rdquo;
                </span>
                <blockquote className="relative text-sm leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="relative mt-4 text-sm font-bold text-gold">
                  {t.name} <span className="font-normal text-muted">— {t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={TESTIMONIALS.length * 0.08}>
          <div className="mt-10 text-center">
            <a
              href={SITE.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-gold transition-colors duration-300 hover:text-accent"
            >
              Read all {GOOGLE_RATING.count} reviews on Google →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
