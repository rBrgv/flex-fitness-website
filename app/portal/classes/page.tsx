import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionMember } from "@/lib/memberSession";
import { listBookableClasses } from "@/lib/classBooking";
import { ClassBookingList } from "@/components/ClassBookingList";
import { PortalNav } from "@/components/PortalNav";

export default async function BookClassesPage() {
  const member = await getSessionMember();
  if (!member) redirect("/portal/login");

  const { enabled, classes } = await listBookableClasses(member);

  return (
    <main className="min-h-screen bg-paper px-5 pb-28 pt-8 sm:px-8 sm:pb-32">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Book a Class</h1>
          <Link href="/portal" className="text-sm font-bold text-muted hover:text-ink">← Back</Link>
        </div>

        {!enabled ? (
          <p className="rounded-2xl border border-line bg-panel p-6 text-sm text-muted">
            Class booking is temporarily unavailable — please message us on WhatsApp instead.
          </p>
        ) : (
          <ClassBookingList classes={classes} />
        )}
      </div>
      <PortalNav active="classes" />
    </main>
  );
}
