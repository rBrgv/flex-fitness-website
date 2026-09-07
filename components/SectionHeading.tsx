import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className = "mb-12 max-w-xl",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{eyebrow}</p>
      </div>
      <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>}
    </Reveal>
  );
}
