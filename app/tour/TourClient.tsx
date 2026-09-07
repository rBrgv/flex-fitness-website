"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { PanoramaViewer } from "@/components/PanoramaViewer";
import { PANORAMAS } from "@/lib/panoramas";
import { SITE } from "@/lib/content";

export function TourClient() {
  const [activeId, setActiveId] = useState(PANORAMAS[0].id);
  const active = PANORAMAS.find((p) => p.id === activeId) ?? PANORAMAS[0];

  return (
    <>
      <Script src="/vendor/pannellum/pannellum.js" strategy="afterInteractive" />

      <div className="flex h-dvh flex-col bg-paper text-ink">
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <Link href="/" className="text-sm font-bold text-ink/80 hover:text-accent">
            &larr; Back to {SITE.name}
          </Link>
          <span className="text-sm font-bold text-gold">{active.label}</span>
          <a
            href={SITE.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-paper"
          >
            Chat on WhatsApp
          </a>
        </header>

        <div className="relative flex-1">
          <PanoramaViewer key={active.id} src={active.image} />
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-line bg-panel p-3">
          {PANORAMAS.map((pano) => (
            <button
              key={pano.id}
              onClick={() => setActiveId(pano.id)}
              className={`relative h-16 w-28 flex-none overflow-hidden rounded-lg border-2 transition-colors ${
                pano.id === activeId ? "border-accent" : "border-transparent"
              }`}
            >
              <Image
                src={pano.image}
                alt={pano.label}
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
