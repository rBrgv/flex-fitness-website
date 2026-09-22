"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BookableClass = {
  class_id: string;
  name: string;
  day: string;
  date: string;
  start_time: string;
  end_time: string;
  spots_left: number;
  already_booked: boolean;
};

function formatDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function ClassBookingList({ classes }: { classes: BookableClass[] }) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleBook(cls: BookableClass) {
    setError("");
    setPendingKey(`${cls.class_id}:${cls.date}`);
    const res = await fetch("/api/portal/classes/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: cls.class_id, date: cls.date }),
    });
    const data = await res.json();
    setPendingKey(null);
    if (!data.ok) return setError(data.message || "Could not book that class.");
    router.refresh();
  }

  async function handleCancel(cls: BookableClass) {
    setError("");
    setPendingKey(`${cls.class_id}:${cls.date}`);
    const res = await fetch("/api/portal/classes/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: cls.class_id, date: cls.date }),
    });
    const data = await res.json();
    setPendingKey(null);
    if (!data.ok) return setError(data.message || "Could not cancel that booking.");
    router.refresh();
  }

  if (classes.length === 0) {
    return <p className="rounded-2xl border border-line bg-panel p-6 text-sm text-muted">No upcoming classes with availability right now.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-400">{error}</p>}
      {classes.map((cls) => {
        const key = `${cls.class_id}:${cls.date}`;
        const isPending = pendingKey === key;
        const isFull = cls.spots_left <= 0 && !cls.already_booked;
        return (
          <div key={key} className="flex items-center justify-between rounded-2xl border border-line bg-panel p-4">
            <div>
              <p className="text-sm font-bold text-ink">{cls.name}</p>
              <p className="text-xs text-muted">
                {cls.day} {formatDate(cls.date)} · {formatTime(cls.start_time)}–{formatTime(cls.end_time)}
              </p>
              {!cls.already_booked && (
                <p className="text-xs text-muted">{isFull ? "Full" : `${cls.spots_left} spots left`}</p>
              )}
            </div>
            {cls.already_booked ? (
              <button
                onClick={() => handleCancel(cls)}
                disabled={isPending}
                className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink hover:border-accent disabled:opacity-60"
              >
                {isPending ? "Cancelling…" : "Cancel"}
              </button>
            ) : (
              <button
                onClick={() => handleBook(cls)}
                disabled={isPending || isFull}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-paper disabled:opacity-60"
              >
                {isPending ? "Booking…" : isFull ? "Full" : "Book"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
