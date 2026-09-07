"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";

// Parses "1,500+" -> { prefix: "", numeral: 1500, suffix: "+" } so we can
// animate the digits while keeping whatever punctuation surrounds them.
function parseValue(raw: string) {
  const match = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return { prefix: "", numeral: 0, suffix: raw, isNumeric: false };
  const [, prefix, digits, suffix] = match;
  return { prefix, numeral: parseInt(digits.replace(/,/g, ""), 10), suffix, isNumeric: true };
}

export function AnimatedNumber({ value }: { value: string }) {
  const { prefix, numeral, suffix, isNumeric } = parseValue(value);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1400, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isNumeric) motionValue.set(numeral);
  }, [isNumeric, numeral, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsubscribe;
  }, [spring]);

  if (!isNumeric) return <span>{value}</span>;

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
