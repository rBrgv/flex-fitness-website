"use client";

import { useState } from "react";

export function FacilityReportForm() {
  const [description, setDescription] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setState("saving");
    const form = new FormData();
    if (description) form.append("description", description);
    form.append("severity", urgent ? "urgent" : "normal");
    if (file) form.append("file", file);

    const res = await fetch("/api/portal/facility-report", { method: "POST", body: form });
    const data = await res.json();
    if (!data.ok) {
      setState("idle");
      setError(data.message || "Could not submit the report.");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-line bg-panel p-6 text-center text-sm text-muted">
        Thanks for flagging that — the team&apos;s on it.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6">
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue"
        rows={3}
        className="mb-3 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-3 w-full text-sm text-ink"
      />
      <label className="mb-3 flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
        This is urgent
      </label>
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={state === "saving"}
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-paper disabled:opacity-60"
      >
        {state === "saving" ? "Submitting…" : "Submit report"}
      </button>
    </div>
  );
}
