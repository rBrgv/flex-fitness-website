import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { PANORAMAS } from "@/lib/panoramas";

export function TourTeaser() {
  const cover = PANORAMAS[1]; // an open gym-floor shot reads better as a cover than the entrance

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:px-8">
      <Reveal>
      <Link
        href="/tour"
        className="group relative block overflow-hidden rounded-3xl border border-line transition-colors duration-300 hover:border-accent/50 hover:shadow-[0_16px_40px_-16px_rgba(232,169,61,0.35)]"
      >
        <Image
          src={cover.image}
          alt="Flex Fitness virtual tour"
          width={2048}
          height={1024}
          className="h-[320px] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-paper">
            <Icon name="map-pin" className="h-3.5 w-3.5" />
            {PANORAMAS.length} real 360° views
          </span>
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Take a virtual tour</h2>
          <p className="max-w-md text-sm text-muted">
            Walk through the gym floor, studio, and reception before you ever visit &mdash; look around freely from {PANORAMAS.length} real spots inside {`Flex Fitness`}.
          </p>
        </div>
      </Link>
      </Reveal>
    </section>
  );
}
