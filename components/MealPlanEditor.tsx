"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = {
  meal_type: string;
  name: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fats_g: string;
  notes: string;
};

type Plan = {
  id: string;
  title: string;
  goal_type: string | null;
  notes: string | null;
};

type PlanItem = {
  meal_type: string;
  name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  notes: string | null;
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const GOAL_TYPES = ["fat_loss", "muscle_gain", "maintenance", "recomposition", "general"];

function blankItem(): Item {
  return { meal_type: "breakfast", name: "", calories: "", protein_g: "", carbs_g: "", fats_g: "", notes: "" };
}

function toItemState(items: PlanItem[]): Item[] {
  if (items.length === 0) return [blankItem()];
  return items.map((i) => ({
    meal_type: i.meal_type,
    name: i.name,
    calories: i.calories?.toString() || "",
    protein_g: i.protein_g?.toString() || "",
    carbs_g: i.carbs_g?.toString() || "",
    fats_g: i.fats_g?.toString() || "",
    notes: i.notes || "",
  }));
}

export function MealPlanEditor({ plan, items }: { plan: Plan | null; items: PlanItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(plan?.title || "");
  const [goalType, setGoalType] = useState(plan?.goal_type || "");
  const [notes, setNotes] = useState(plan?.notes || "");
  const [rows, setRows] = useState<Item[]>(toItemState(items));
  const [state, setState] = useState<"idle" | "saving" | "deleting">("idle");
  const [error, setError] = useState("");

  function updateRow(index: number, patch: Partial<Item>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, blankItem()]);
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    if (!title.trim()) return setError("Title is required.");
    const cleanItems = rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        meal_type: r.meal_type,
        name: r.name.trim(),
        calories: r.calories ? Number(r.calories) : null,
        protein_g: r.protein_g ? Number(r.protein_g) : null,
        carbs_g: r.carbs_g ? Number(r.carbs_g) : null,
        fats_g: r.fats_g ? Number(r.fats_g) : null,
        notes: r.notes.trim() || null,
      }));
    if (cleanItems.length === 0) return setError("At least one meal item is required.");

    setState("saving");
    const url = plan ? `/api/trainer/meal-plans/${plan.id}` : "/api/trainer/meal-plans";
    const method = plan ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, goal_type: goalType || null, notes: notes || null, items: cleanItems }),
    });
    const data = await res.json();
    setState("idle");
    if (!data.ok) return setError(data.error || "Could not save.");
    router.push("/trainer/meal-plans");
    router.refresh();
  }

  async function handleDelete() {
    if (!plan) return;
    if (!confirm("Delete this template?")) return;
    setState("deleting");
    const res = await fetch(`/api/trainer/meal-plans/${plan.id}`, { method: "DELETE" });
    const data = await res.json();
    setState("idle");
    if (!data.ok) return setError(data.error || "Could not delete.");
    router.push("/trainer/meal-plans");
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
          placeholder="e.g. Fat Loss — 1600 kcal"
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
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Meals</p>
        <div className="flex flex-col gap-4">
          {rows.map((row, i) => (
            <div key={i} className="rounded-lg border border-line bg-paper p-4">
              <div className="mb-2 flex items-center justify-between">
                <select
                  value={row.meal_type}
                  onChange={(e) => updateRow(i, { meal_type: e.target.value })}
                  className="rounded-lg border border-line bg-panel px-2 py-1 text-xs font-bold uppercase text-ink"
                >
                  {MEAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-xs font-bold text-muted hover:text-ink">
                    Remove
                  </button>
                )}
              </div>
              <input
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
                placeholder="Food / meal description"
                className="mb-2 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink"
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  value={row.calories}
                  onChange={(e) => updateRow(i, { calories: e.target.value })}
                  placeholder="kcal"
                  inputMode="decimal"
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink"
                />
                <input
                  value={row.protein_g}
                  onChange={(e) => updateRow(i, { protein_g: e.target.value })}
                  placeholder="protein g"
                  inputMode="decimal"
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink"
                />
                <input
                  value={row.carbs_g}
                  onChange={(e) => updateRow(i, { carbs_g: e.target.value })}
                  placeholder="carbs g"
                  inputMode="decimal"
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink"
                />
                <input
                  value={row.fats_g}
                  onChange={(e) => updateRow(i, { fats_g: e.target.value })}
                  placeholder="fats g"
                  inputMode="decimal"
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink"
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addRow} className="mt-3 text-sm font-bold text-gold hover:underline">
          + Add meal item
        </button>
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
