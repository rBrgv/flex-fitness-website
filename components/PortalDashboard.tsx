"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { PortalNav } from "@/components/PortalNav";
import { SITE } from "@/lib/content";
import { todayInGymTimezone } from "@/lib/dateUtils";

type Member = {
  name: string;
  phone: string;
  status: string;
  membership_plan: string | null;
  plan_start_date: string | null;
  plan_end_date: string | null;
  trainer_name: string | null;
};
type Booking = {
  id: string;
  class_date: string;
  classes: { name: string; start_time: string; end_time: string } | null;
};
type AttendanceRow = { checked_in_at: string };

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  frozen: "Frozen",
  cancelled: "Cancelled",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function daysUntil(date: string) {
  const today = new Date(`${todayInGymTimezone()}T12:00:00Z`);
  const end = new Date(`${date}T12:00:00Z`);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function PortalDashboard({
  member,
  bookings,
  attendance,
}: {
  member: Member;
  bookings: Booking[];
  attendance: AttendanceRow[];
}) {
  const router = useRouter();
  const [checkinState, setCheckinState] = useState<"idle" | "loading" | "done" | "already" | "error">("idle");
  const [confirmedAttendance, setConfirmedAttendance] = useState(attendance);

  async function handleCheckin() {
    setCheckinState("loading");
    try {
      const res = await fetch("/api/member/checkin", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Check-in failed");
      setCheckinState(data.alreadyCheckedIn ? "already" : "done");
      if (!data.alreadyCheckedIn) {
        setConfirmedAttendance(previous => [{ checked_in_at: data.checkedInAt || new Date().toISOString() }, ...previous].slice(0, 10));
      }
    } catch {
      setCheckinState("error");
    }
  }

  async function handleLogout() {
    await fetch("/api/member-auth/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-paper px-5 pb-28 pt-8 sm:px-8 sm:pb-32">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-7 w-7 flex-none" aria-hidden="true">
              <path
                d="M4 6h9l3 6 3-6h9l-8 10 8 10h-9l-3-6-3 6H4l8-10Z"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display text-lg font-semibold uppercase leading-none tracking-tight text-ink">
              Flex <span className="text-gold">Fitness</span>
            </span>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-muted hover:text-ink">
            Log out
          </button>
        </div>

        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Hi, {member.name.split(" ")[0]}</h1>
        <p className="mb-6 text-sm text-muted">Here&apos;s your membership today.</p>

        <div className="mb-6 rounded-2xl border border-line bg-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-muted">Membership</span>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-gold">
              {STATUS_LABEL[member.status] || member.status}
            </span>
          </div>
          <p className="text-lg font-bold text-ink">{member.membership_plan || "—"}</p>
          {member.plan_end_date && (
            <>
              <p className="mt-1 text-sm text-muted">Expires {formatDate(member.plan_end_date)}</p>
              <p className={`mt-2 text-sm font-bold ${daysUntil(member.plan_end_date) <= 7 ? "text-red-400" : "text-gold"}`}>
                {daysUntil(member.plan_end_date) < 0
                  ? `Expired ${Math.abs(daysUntil(member.plan_end_date))} days ago`
                  : daysUntil(member.plan_end_date) === 0
                    ? "Expires today"
                    : `${daysUntil(member.plan_end_date)} days remaining`}
              </p>
            </>
          )}
          {member.trainer_name && <p className="mt-3 text-sm text-muted">Trainer: <span className="text-ink">{member.trainer_name}</span></p>}
        </div>

        <div className="mb-6 rounded-2xl border border-line bg-panel p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-muted">Today</span>
          </div>
          <button
            onClick={handleCheckin}
            disabled={checkinState === "loading" || checkinState === "done" || checkinState === "already"}
            className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-paper transition-opacity disabled:opacity-60"
          >
            {checkinState === "loading" && "Checking in…"}
            {checkinState === "idle" && "Check in"}
            {checkinState === "done" && "✓ Checked in"}
            {checkinState === "already" && "✓ Already checked in today"}
            {checkinState === "error" && "Try check-in again"}
          </button>
          {checkinState === "error" && <p className="mt-3 text-center text-xs text-red-400">Check-in didn&apos;t work. Please try again or message the gym.</p>}
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <Link href="/portal/classes" className="rounded-2xl border border-line bg-panel p-4 text-center text-sm font-bold text-ink hover:border-accent">
            Book a Class
          </Link>
          <Link href="/portal/nutrition" className="rounded-2xl border border-line bg-panel p-4 text-center text-sm font-bold text-ink hover:border-accent">
            Nutrition Plan
          </Link>
          <Link href="/portal/progress" className="rounded-2xl border border-line bg-panel p-4 text-center text-sm font-bold text-ink hover:border-accent">
            Progress
          </Link>
        </div>

        <a href={SITE.whatsappLink} className="mb-6 block rounded-2xl border border-gold/40 bg-accent/10 p-4 text-center text-sm font-bold text-gold hover:border-gold">
          Need help? Message us
        </a>

        <div className="mb-6 rounded-2xl border border-line bg-panel p-6">
          <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">Upcoming classes</span>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted">
              No upcoming bookings. <Link href="/portal/classes" className="font-bold text-gold hover:underline">Book a class →</Link>
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-bold text-ink">{b.classes?.name}</p>
                    <p className="text-xs text-muted">
                      {b.classes && `${formatTime(b.classes.start_time)}–${formatTime(b.classes.end_time)}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{formatDate(b.class_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-panel p-6">
          <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">Recent attendance</span>
          {confirmedAttendance.length === 0 ? (
            <p className="text-sm text-muted">No check-ins logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {confirmedAttendance.map((a, i) => (
                <li key={i} className="text-sm text-ink">
                  {new Date(a.checked_in_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <PortalNav active="home" />
    </main>
  );
}
