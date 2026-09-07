import type { Metadata } from "next";
import { TourClient } from "./TourClient";

export const metadata: Metadata = {
  title: "Virtual Tour | Flex Fitness",
  description: "Walk through Flex Fitness Bengaluru — 19 real 360° views of the gym floor, studio, and reception.",
};

export default function TourPage() {
  return <TourClient />;
}
