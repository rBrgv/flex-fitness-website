import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { AmbientGlow } from "./AmbientGlow";
import { SectionHeading } from "./SectionHeading";
import { MEMBERSHIP_PLANS, REGISTRATION_FEE, FREE_TRIAL, SITE } from "@/lib/content";

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-panel py-20">
      <AmbientGlow side="left" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Membership"
          title="Simple, upfront pricing"
          description={`One-time registration of ${REGISTRATION_FEE}, then pick the plan that fits. ${FREE_TRIAL}`}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          {MEMBERSHIP_PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div
                className={`relative h-full overflow-hidden rounded-2xl border p-6 transition-transform duration-300 hover:-translate-y-1 ${
                  i === 1 ? "border-accent bg-paper shadow-[0_0_0_1px_var(--color-accent)]" : "border-line bg-paper"
                }`}
              >
                {i === 1 && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 animate-pulse rounded-full bg-accent/25 blur-3xl"
                  />
                )}
                {i === 1 && (
                  <span className="relative mb-3 inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-paper">
                    Most popular
                  </span>
                )}
                <h3 className="relative text-lg font-bold text-ink">{plan.name}</h3>
                <p className="relative mt-2 text-3xl font-extrabold text-gold">
                  {plan.price}
                  {plan.note && <span className="ml-1 text-sm font-medium text-muted">{plan.note}</span>}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <a
          href={SITE.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline"
        >
          <Icon name="whatsapp" className="h-4 w-4" />
          Ask about family packages and referral rewards
        </a>
      </div>
    </section>
  );
}
