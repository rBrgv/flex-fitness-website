import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { TourTeaser } from "@/components/TourTeaser";
import { Services } from "@/components/Services";
import { Pricing } from "@/components/Pricing";
import { GoldDivider } from "@/components/GoldDivider";
import { Facilities } from "@/components/Facilities";
import { Hours } from "@/components/Hours";
import { Testimonials } from "@/components/Testimonials";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <TourTeaser />
        <Services />
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
