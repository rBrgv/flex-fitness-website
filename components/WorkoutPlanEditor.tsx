"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Exercise = {
  day_label: string;
  name: string;
  sets: string;
  reps: string;
  rest_seconds: string;
  notes: string;
};

type Plan = {
  id: string;
  title: string;
  goal_type: string | null;
  notes: string | null;
};

type PlanExercise = {
  day_label: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  notes: string | null;
};

const GOAL_TYPES = ["strength", "hypertrophy", "fat_loss", "general"];

function blankExercise(dayLabel = "Day 1"): Exercise {
  return { day_label: dayLabel, name: "", sets: "", reps: "", rest_seconds: "", notes: "" };
}

function toExerciseState(exercises: PlanExercise[]): Exercise[] {
  if (exercises.length === 0) return [blankExercise()];
  return exercises.map((e) => ({
    day_label: e.day_label,
    name: e.name,
    sets: e.sets?.toString() || "",
    reps: e.reps || "",
    rest_seconds: e.rest_seconds?.toString() || "",
    notes: e.notes || "",
  }));
}

export function WorkoutPlanEditor({ plan, exercises }: { plan: Plan | null; exercises: PlanExercise[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(plan?.title || "");
  const [goalType, setGoalType] = useState(plan?.goal_type || "");
  const [notes, setNotes] = useState(plan?.notes || "");
  const [rows, setRows] = useState<Exercise[]>(toExerciseState(exercises));
  const [state, setState] = useState<"idle" | "saving" | "deleting">("idle");
  const [error, setError] = useState("");

  function updateRow(index: number, patch: Partial<Exercise>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function addRow(afterIndex: number) {
    setRows((prev) => {
      const dayLabel = prev[afterIndex]?.day_label || "Day 1";
      const copy = [...prev];
      copy.splice(afterIndex + 1, 0, blankExercise(dayLabel));
      return copy;
    });
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    if (!title.trim()) return setError("Title is required.");
    const cleanExercises = rows
      .filter((r) => r.name.trim() && r.day_label.trim())
      .map((r) => ({
        day_label: r.day_label.trim(),
        name: r.name.trim(),
        sets: r.sets ? Number(r.sets) : null,
        reps: r.reps.trim() || null,
        rest_seconds: r.rest_seconds ? Number(r.rest_seconds) : null,
        notes: r.notes.trim() || null,
      }));
    if (cleanExercises.length === 0) return setError("At least one exercise is required.");

    setState("saving");
    const url = plan ? `/api/trainer/workout-plans/${plan.id}` : "/api/trainer/workout-plans";
    const method = plan ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, goal_type: goalType || null, notes: notes || null, exercises: cleanExercises }),
    });
    const data = await res.json();
    setState("idle");
    if (!data.ok) return setError(data.error || "Could not save.");
    router.push("/trainer/workout-plans");
    router.refresh();
  }

  async function handleDelete() {
    if (!plan) return;
    if (!confirm("Delete this template?")) return;
    setState("deleting");
    const res = await fetch(`/api/trainer/workout-plans/${plan.id}`, { method: "DELETE" });
    const data = await res.json();
    setState("idle");
    if (!data.ok) return setError(data.error || "Could not delete.");
    router.push("/trainer/workout-plans");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-line bg-panel p-6">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
          placeholder="e.g. Push/Pull/Legs — Strength"
        />

        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Goal</label>
        <select
          value={goalType}
          onChange={(e) => setGoalType(e.target.value)}
          className="mb-4 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
        >
          <option value="">— none —</option>
          {GOAL_TYPES.map((g) => (
            <option key={g} value={g}>{g.replace("_", " ")}</option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
          rows={2}
        />
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Exercises</p>
        <div className="flex flex-col gap-4">
          {rows.map((row, i) => (
            <div key={i} className="rounded-lg border border-line bg-paper p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <input
                  value={row.day_label}
                  onChange={(e) => updateRow(i, { day_label: e.target.value })}
                  placeholder="Day label (e.g. Day 1, Push)"
                  className="flex-1 rounded-lg border border-line bg-panel px-2 py-1 text-xs font-bold uppercase text-ink"
                />
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-xs font-bold text-muted hover:text-ink">
                    Remove
                  </button>
                )}
              </div>
              <input
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
                placeholder="Exercise name"
                className="mb-2 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={row.sets}
                  onChange={(e) => updateRow(i, { sets: e.target.value })}
                  placeholder="sets"
                  inputMode="numeric"
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink"
                />
                <input
                  value={row.reps}
                  onChange={(e) => updateRow(i, { reps: e.target.value })}
                  placeholder="reps (e.g. 8-12)"
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink"
                />
                <input
                  value={row.rest_seconds}
                  onChange={(e) => updateRow(i, { rest_seconds: e.target.value })}
                  placeholder="rest (sec)"
                  inputMode="numeric"
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink"
                />
              </div>
              <button onClick={() => addRow(i)} className="mt-2 text-xs font-bold text-gold hover:underline">
                + Add exercise after this
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={state !== "idle"}
          className="rounded-lg bg-accent px-4 py-3 text-sm font-bold text-paper disabled:opacity-60"
        >
          {state === "saving" ? "Saving…" : "Save template"}
        </button>
        {plan && (
          <button
            onClick={handleDelete}
            disabled={state !== "idle"}
            className="text-sm font-bold text-muted hover:text-ink disabled:opacity-60"
          >
            {state === "deleting" ? "Deleting…" : "Delete template"}
          </button>
        )}
      </div>
    </div>
  );
}
