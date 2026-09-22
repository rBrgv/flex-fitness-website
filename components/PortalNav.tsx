import Link from "next/link";
import { SITE } from "@/lib/content";

type PortalSection = "home" | "nutrition" | "progress" | "classes";

const items: { key: PortalSection; href: string; label: string; icon: string }[] = [
  { key: "home", href: "/portal", label: "Home", icon: "⌂" },
  { key: "classes", href: "/portal/classes", label: "Classes", icon: "▤" },
  { key: "nutrition", href: "/portal/nutrition", label: "Nutrition", icon: "◎" },
  { key: "progress", href: "/portal/progress", label: "Progress", icon: "↗" },
];

export function PortalNav({ active }: { active: PortalSection }) {
  return (
    <nav aria-label="Member portal" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[420px] sm:-translate-x-1/2 sm:rounded-2xl sm:border">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const selected = active === item.key;
          return (
            <Link key={item.key} href={item.href} aria-current={selected ? "page" : undefined} className={`rounded-xl px-2 py-2 text-center text-[11px] font-bold ${selected ? "bg-accent/15 text-gold" : "text-muted hover:text-ink"}`}>
              <span aria-hidden="true" className="mb-0.5 block text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <a href={SITE.whatsappLink} className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-muted hover:text-ink">
          <span aria-hidden="true" className="mb-0.5 block text-lg leading-none">◌</span>
          Help
        </a>
      </div>
    </nav>
  );
}
