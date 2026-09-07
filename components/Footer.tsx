import Image from "next/image";
import { Icon } from "./Icon";
import { GoldDivider } from "./GoldDivider";
import { SITE } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel">
      <GoldDivider />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Image
            src={SITE.logo.markSquare}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 flex-none rounded-lg border border-line object-cover"
          />
          <div>
            <p className="text-base font-extrabold text-ink">{SITE.legalName}</p>
            <p className="mt-1 text-sm text-muted">{SITE.neighborhood}, {SITE.city}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <a href={`tel:${SITE.phone}`} className="font-medium text-ink/80 transition-colors hover:text-accent">
            {SITE.phone} / {SITE.phoneAlt}
          </a>
          <a href={`mailto:${SITE.email}`} className="font-medium text-ink/80 transition-colors hover:text-accent">
            {SITE.email}
          </a>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink/80 transition-colors hover:text-accent"
          >
            Instagram
          </a>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <a
            href={SITE.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline"
          >
            <Icon name="whatsapp" className="h-4 w-4" />
            Message us on WhatsApp
          </a>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted/70">Powered by CampaignWise</p>
        </div>
      </div>
    </footer>
  );
}
