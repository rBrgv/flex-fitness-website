"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { HOURS, HOLIDAY_POLICY, SITE } from "@/lib/content";

export function Hours() {
  // Computed client-side only, after mount, so server/client renders match
  // regardless of timezone — starts null (no highlight) until then.
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    // Reading the system clock is only valid client-side; this is React's
    // documented pattern for values that necessarily differ between server
    // and client render (see: hydrateRoot docs, "handling different content").
    const jsDay = new Date().getDay(); // 0 = Sunday
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(HOURS[(jsDay + 6) % 7].day);
  }, []);

  return (
    <section id="hours" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Visit us" title="Hours & location" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-2xl border border-line bg-panel p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <Icon name="clock" className="h-4.5 w-4.5 text-accent" />
              Opening hours
            </div>
            <dl className="divide-y divide-line">
              {HOURS.map((row) => {
                const isToday = row.day === today;
                return (
                  <div
                    key={row.day}
                    className={`flex items-center justify-between rounded-lg py-2.5 text-sm transition-colors ${
                      isToday ? "-mx-2 bg-accent/10 px-2" : ""
                    }`}
                  >
                    <dt className={`flex items-center gap-2 font-medium ${isToday ? "text-gold" : "text-ink"}`}>
                      {row.day}
                      {isToday && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-paper">Today</span>}
                    </dt>
                    <dd className={isToday ? "font-semibold text-gold" : "text-muted"}>{row.time}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-4 text-xs text-muted">{HOLIDAY_POLICY}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex h-full flex-col rounded-2xl border border-line bg-panel p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <Icon name="map-pin" className="h-4.5 w-4.5 text-accent" />
              Location
            </div>
            <p className="text-sm leading-relaxed text-muted">{SITE.address}</p>
            <p className="mt-2 text-sm font-medium text-ink">
              {SITE.phone} / {SITE.phoneAlt}
            </p>
            <a
              href={SITE.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 py-8 text-center transition-all duration-300 hover:border-accent hover:bg-accent/5"
            >
              <Icon name="map-pin" className="h-6 w-6 text-gold" />
              <span className="text-sm font-bold text-ink">View on Google Maps</span>
              <span className="text-xs text-muted">Includes a 360° view and photos/videos of the gym</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
