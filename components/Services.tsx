import Image from "next/image";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { SERVICES } from "@/lib/content";

export function Services() {
  return (
    <section id="services" className="relative mx-auto max-w-6xl overflow-hidden px-5 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="What we offer"
        title="Everything you need to train, in one place"
        description="Real photos from inside Flex Fitness — not stock images."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, i) => (
          <Reveal key={service.name} delay={i * 0.07}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_12px_32px_-12px_rgba(232,169,61,0.25)]">
              <div className="relative h-36 w-full overflow-hidden">
                <Image
                  src={service.photo}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/10 to-transparent" />
                <div className="absolute bottom-0 left-5 flex h-11 w-11 translate-y-1/2 items-center justify-center rounded-xl bg-accent text-paper shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon name={service.icon} className="h-5 w-5" />
                </div>
              </div>
              <div className="p-6 pt-8">
                <h3 className="mb-2 text-lg font-bold text-ink">{service.name}</h3>
                <p className="text-sm leading-relaxed text-muted">{service.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
