"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { HeroBackground } from "./HeroBackground";
import { PANORAMAS } from "@/lib/panoramas";
import { SITE } from "@/lib/content";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-paper text-ink">
      <HeroBackground src={PANORAMAS[3].image} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(232,169,61,0.10),_transparent_60%)]"
      />

      <motion.div
        className="relative mx-auto grid min-w-0 max-w-6xl gap-12 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="min-w-0">
          <motion.p variants={item} className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            {SITE.neighborhood}, {SITE.city} · {SITE.memberCount} members and counting
          </motion.p>
          <motion.h1
            variants={item}
            className="max-w-xl break-words text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            The{" "}
            <motion.span
              className="bg-gradient-to-r from-gold via-amber-100 to-gold bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            >
              {SITE.tagline}
            </motion.span>
            .
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            General gym, personal training, group classes, functional training, and sports injury
            rehab — across {SITE.sqft}. {SITE.greetingLine}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
            <a
              href={SITE.whatsappTrialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-paper transition-transform duration-300 hover:scale-105"
            >
              <Icon name="whatsapp" className="h-5 w-5" />
              Book a Free Trial
            </a>
            <a
              href={SITE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-accent hover:text-gold"
            >
              Just Chat with Us
            </a>
          </motion.div>
        </div>

        <motion.div
          className="relative mx-auto min-w-0 w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.92, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-2xl"
            animate={{ scale: [0.85, 1.05, 0.85], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <Image
            src={SITE.logo.markGoldOnBlack}
            alt={`${SITE.name} emblem`}
            width={1600}
            height={1150}
            className="w-full scale-[1.35]"
            style={{
              maskImage: "radial-gradient(ellipse 62% 62% at center, black 55%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 62% 62% at center, black 55%, transparent 100%)",
            }}
            priority
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
