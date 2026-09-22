import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionMember } from "@/lib/memberSession";
import { FacilityReportForm } from "@/components/FacilityReportForm";
import { PortalNav } from "@/components/PortalNav";

export default async function ReportIssuePage() {
  const member = await getSessionMember();
  if (!member) redirect("/portal/login");

  return (
    <main className="min-h-screen bg-paper px-5 pb-28 pt-8 sm:px-8 sm:pb-32">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Report a Facility Issue</h1>
          <Link href="/portal" className="text-sm font-bold text-muted hover:text-ink">← Back</Link>
        </div>
        <FacilityReportForm />
      </div>
      <PortalNav active="home" />
    </main>
  );
}
