"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { MobileMenu } from "./MobileMenu";
import { SITE } from "@/lib/content";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#schedule", label: "Schedule" },
  { href: "#pricing", label: "Pricing" },
  { href: "#facilities", label: "Facilities" },
  { href: "/tour", label: "Virtual Tour" },
  { href: "#hours", label: "Hours & Location" },
  { href: "#testimonials", label: "Members" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-paper/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-line shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)]" : "border-transparent"
      }`}
    >
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
        <Link href="#top" className="group flex flex-none items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="h-7 w-7 flex-none sm:h-8 sm:w-8" aria-hidden="true">
            <path
              d="M4 6h9l3 6 3-6h9l-8 10 8 10h-9l-3-6-3 6H4l8-10Z"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </svg>
          <span className="font-display text-lg font-semibold uppercase leading-none tracking-tight text-ink sm:text-xl">
            Flex <span className="text-gold">Fitness</span>
          </span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-3">
          <a
            href={SITE.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-paper transition-colors hover:bg-accent-dark"
          >
            <Icon name="whatsapp" className="h-4 w-4" />
            <span className="hidden sm:inline">Chat on WhatsApp</span>
            <span className="sm:hidden">Chat</span>
          </a>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
