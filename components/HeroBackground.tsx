"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";

// A real 360° panorama, dimmed and gently panned with the cursor to suggest
// "looking around" the gym — without the cost of a full WebGL 360° viewer.
// Layered with a slow Ken Burns zoom and drifting colored light (echoing the
// actual neon in the real photo) so the hero stays alive even without cursor input.
export function HeroBackground({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 40, damping: 20, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 40, damping: 20, mass: 0.6 });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReduceMotion(mql.matches);
    mql.addEventListener("change", handleChange);
    if (mql.matches) return () => mql.removeEventListener("change", handleChange);

    function handleMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(nx * -70);
      y.set(ny * -28);
    }

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      mql.removeEventListener("change", handleChange);
    };
  }, [x, y]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-[-8%]"
        style={{ x: springX, y: springY }}
        animate={reduceMotion ? undefined : { scale: [1, 1.09, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={src}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1600px) 1600px, 100vw"
          quality={45}
        />
      </motion.div>

      {/* Drifting, color-shifting light — echoes the real pink/purple neon in the photo */}
      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden="true"
            className="absolute h-[34rem] w-[34rem] rounded-full blur-[100px] mix-blend-screen"
            style={{ background: "radial-gradient(circle, rgba(232,169,61,0.35), transparent 70%)" }}
            animate={{ x: [-80, 120, -80], y: [-60, 40, -60], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute right-0 h-[30rem] w-[30rem] rounded-full blur-[100px] mix-blend-screen"
            style={{ background: "radial-gradient(circle, rgba(217,70,160,0.30), transparent 70%)" }}
            animate={{ x: [60, -100, 60], y: [80, -20, 80], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full blur-[100px] mix-blend-screen"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22), transparent 70%)" }}
            animate={{ x: [-40, 60, -40], y: [30, -50, 30], opacity: [0.3, 0.65, 0.3] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </>
      )}

      {/* Dim + tie into the brand palette so foreground text stays readable */}
      <div className="absolute inset-0 bg-paper/72" />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/30 via-paper/70 to-paper" />
    </div>
  );
}
