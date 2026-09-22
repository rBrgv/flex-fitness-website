import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/content";

export function MarketingHero() {
  return (
    <section id="top" className="marketing-hero">
      <div className="marketing-intro">
        <p className="marketing-eyebrow">{SITE.neighborhood} · {SITE.city}</p>
        <h1>Find your strength.<br /><span>Find your people.</span></h1>
        <p className="marketing-description">Your first workout or your next personal best. Make room for both at Flex Fitness — with personal training, group classes, and space to grow.</p>
        <div className="marketing-actions">
          <a className="marketing-primary" href={SITE.whatsappTrialLink}>Book a free trial <span aria-hidden="true">↗</span></a>
          <a className="marketing-secondary" href="#pricing">Explore memberships <span aria-hidden="true">↓</span></a>
        </div>
        <p className="marketing-note">{SITE.greetingLine} <span>{SITE.memberCount} members and counting.</span></p>
        <Link href="/portal/login" className="marketing-member">Already part of Flex? Member login →</Link>
      </div>
      <div className="marketing-photo">
        <Image src="/gallery/general-gym.jpg" alt="Training floor and equipment inside Flex Fitness" fill priority sizes="(max-width: 800px) 100vw, 50vw" className="object-cover" />
        <div className="marketing-photo-shade" />
        <span className="marketing-photo-tag">FLEX FITNESS / BY NITHISH</span>
        <div className="marketing-photo-caption"><p>The {SITE.tagline}.</p><Link href="/tour">Step inside · 360° tour <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  );
}
