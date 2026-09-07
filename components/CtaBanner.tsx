"use client";

import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/content";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-dark to-accent px-8 py-14 text-center text-paper sm:px-16">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-64 w-64 rounded-full bg-white/10 blur-3xl"
            animate={{ x: [-40, 40, -40], y: [-30, 20, -30] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            style={{ right: "-4rem", top: "-4rem" }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-48 w-48 rounded-full bg-paper/10 blur-3xl"
            animate={{ x: [30, -30, 30], y: [20, -20, 20] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            style={{ left: "-3rem", bottom: "-3rem" }}
          />
          <h2 className="relative text-2xl font-extrabold sm:text-3xl">
            Ready to see what {SITE.name} can do for you?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-paper/80">
            Book a free trial, or just message us with questions — our team (and our assistant) will get you sorted.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={SITE.whatsappTrialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-bold text-gold transition-transform duration-300 hover:scale-105"
            >
              <Icon name="whatsapp" className="h-5 w-5" />
              Book a Free Trial
            </a>
            <a
              href={SITE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-paper/40 px-6 py-3 text-sm font-bold text-paper transition-colors duration-300 hover:bg-paper/10"
            >
              Just Chat with Us
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
