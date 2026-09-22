"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProgressLog = {
  id: string;
  log_date: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arms_cm: number | null;
  thighs_cm: number | null;
  hips_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
};

type ProgressPhoto = {
  id: string;
  url: string;
  log_date: string;
  view_type: string;
  is_milestone: boolean;
};

const MEASUREMENT_FIELDS: { key: keyof ProgressLog; label: string; unit: string }[] = [
  { key: "weight_kg", label: "Weight", unit: "kg" },
  { key: "body_fat_percentage", label: "Body fat", unit: "%" },
  { key: "waist_cm", label: "Waist", unit: "cm" },
  { key: "chest_cm", label: "Chest", unit: "cm" },
  { key: "arms_cm", label: "Arms", unit: "cm" },
  { key: "thighs_cm", label: "Thighs", unit: "cm" },
  { key: "hips_cm", label: "Hips", unit: "cm" },
  { key: "neck_cm", label: "Neck", unit: "cm" },
];

function formatDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function MemberProgressTracker({
  today,
  logs,
  photos,
}: {
  today: string;
  logs: ProgressLog[];
  photos: ProgressPhoto[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"measurements" | "photos">("measurements");
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [viewType, setViewType] = useState("front");
  const [isMilestone, setIsMilestone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  async function handleSaveMeasurements() {
    setError("");
    setSaving(true);
    const body: Record<string, unknown> = { date: today };
    for (const f of MEASUREMENT_FIELDS) {
      if (form[f.key]) body[f.key] = Number(form[f.key]);
    }
    if (form.notes) body.notes = form.notes;

    const res = await fetch("/api/member/progress/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.ok) return setError(data.error || "Could not save.");
    setForm({});
    router.refresh();
  }

  async function handleUploadPhoto() {
    setPhotoError("");
    if (!photoFile) return setPhotoError("Choose a photo first.");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", photoFile);
    fd.append("view_type", viewType);
    fd.append("date", today);
    fd.append("is_milestone", String(isMilestone));

    const res = await fetch("/api/member/progress/photos", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!data.ok) return setPhotoError(data.error || "Could not upload.");
    setPhotoFile(null);
    setIsMilestone(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-line">
        <button
          onClick={() => setTab("measurements")}
          className={`px-3 py-2 text-sm font-bold ${tab === "measurements" ? "border-b-2 border-gold text-gold" : "text-muted"}`}
        >
          Measurements
        </button>
        <button
          onClick={() => setTab("photos")}
          className={`px-3 py-2 text-sm font-bold ${tab === "photos" ? "border-b-2 border-gold text-gold" : "text-muted"}`}
        >
          Photos
        </button>
      </div>

      {tab === "measurements" && (
        <>
          <div className="rounded-2xl border border-line bg-panel p-6">
            <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">Log today&apos;s numbers</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MEASUREMENT_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs text-muted">{f.label} ({f.unit})</label>
                  <input
                    value={form[f.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-sm text-ink"
                  />
                </div>
              ))}
            </div>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes (optional)"
              rows={2}
              className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            />
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            <button
              onClick={handleSaveMeasurements}
              disabled={saving}
              className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-paper disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save entry"}
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-6">
            <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">History</span>
            {logs.length === 0 ? (
              <p className="text-sm text-muted">No entries yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-line bg-paper p-4">
                    <p className="mb-1 text-xs font-bold text-muted">{formatDate(log.log_date)}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {MEASUREMENT_FIELDS.filter((f) => log[f.key] != null).map((f) => (
                        <span key={f.key} className="text-sm text-ink">
                          {f.label}: <span className="font-bold">{String(log[f.key])}{f.unit}</span>
                        </span>
                      ))}
                    </div>
                    {log.notes && <p className="mt-2 text-xs text-muted">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "photos" && (
        <>
          <div className="rounded-2xl border border-line bg-panel p-6">
            <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">Upload a photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="mb-3 w-full text-sm text-ink"
            />
            <div className="mb-3 flex items-center gap-3">
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
              >
                <option value="front">Front</option>
                <option value="side">Side</option>
                <option value="back">Back</option>
                <option value="other">Other</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={isMilestone} onChange={(e) => setIsMilestone(e.target.checked)} />
                Milestone
              </label>
            </div>
            {photoError && <p className="mb-2 text-xs text-red-400">{photoError}</p>}
            <button
              onClick={handleUploadPhoto}
              disabled={uploading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-paper disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-6">
            <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">History</span>
            {photos.length === 0 ? (
              <p className="text-sm text-muted">No photos yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <div key={p.id} className="relative overflow-hidden rounded-lg border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`${p.view_type} — ${formatDate(p.log_date)}`} className="h-28 w-full object-cover" />
                    {p.is_milestone && (
                      <span className="absolute right-1 top-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-paper">
                        Milestone
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
