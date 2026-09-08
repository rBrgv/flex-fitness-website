import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { TourTeaser } from "@/components/TourTeaser";
import { Services } from "@/components/Services";
import { ClassSchedule } from "@/components/ClassSchedule";
import { Pricing } from "@/components/Pricing";
import { GoldDivider } from "@/components/GoldDivider";
import { Facilities } from "@/components/Facilities";
import { Hours } from "@/components/Hours";
import { Testimonials } from "@/components/Testimonials";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

// Revalidate hourly so class-schedule changes made in the dashboard show up
// here without a full redeploy — everything else on this page is static.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <TourTeaser />
        <Services />
        <ClassSchedule />
        <Pricing />
        <GoldDivider />
        <Facilities />
        <Hours />
        <GoldDivider />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
