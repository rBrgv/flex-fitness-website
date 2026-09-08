import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves the default quality (75) unless explicitly
    // allow-listed here — without this, quality={45} on next/image gets
    // silently clamped back to 75 at request time, no build warning.
    qualities: [45, 75],
  },
};

export default nextConfig;
