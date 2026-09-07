"use client";

import { motion } from "framer-motion";

// A single quiet gold glow for bg-panel sections — much more restrained than
// the hero's layered lights, just enough to keep every section from feeling flat.
export function AmbientGlow({ side = "right" }: { side?: "left" | "right" }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[100px] ${
        side === "right" ? "right-0" : "left-0"
      }`}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
