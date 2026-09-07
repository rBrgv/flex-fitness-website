"use client";

import { motion } from "framer-motion";

export function GoldDivider() {
  return (
    <motion.div
      className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
