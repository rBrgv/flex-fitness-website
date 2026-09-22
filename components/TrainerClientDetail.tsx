"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MealItem = {
  meal_type: string;
  name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
};

type ActiveAssignment = {
  id: string;
  start_date: string;
  end_date: string | null;
  plan: { id: string; title: string; goal_type: string | null; meal_plan_items: MealItem[] } | null;
};

type Template = { id: string; title: string };

type WorkoutExercise = {
  day_label: string;
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
};

type ActiveWorkoutAssignment = {
  id: string;
  start_date: string;
  end_date: string | null;
  plan: { id: string; title: string; goal_type: string | null; workout_plan_exercises: WorkoutExercise[] } | null;
};

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

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

function formatDate(d: string) {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupByMeal(items: MealItem[]) {
  const groups: Record<string, MealItem[]> = {};
  for (const item of items) {
    (groups[item.meal_type] ||= []).push(item);
  }
  return MEAL_ORDER.filter((t) => groups[t]?.length).map((t) => ({ type: t, items: groups[t] }));
}

function groupByDay(exercises: WorkoutExercise[]) {
  const groups: Record<string, WorkoutExercise[]> = {};
  const order: string[] = [];
  for (const ex of exercises) {
    if (!groups[ex.day_label]) {
      groups[ex.day_label] = [];
      order.push(ex.day_label);
    }
    groups[ex.day_label].push(ex);
  }
  return order.map((day) => ({ day, exercises: groups[day] }));
}

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

export function TrainerClientDetail({
  memberId,
  activeAssignment,
  templates,
  activeWorkoutAssignment,
  workoutTemplates,
  logs,
  photos,
}: {
  memberId: string;
  activeAssignment: ActiveAssignment | null;
  templates: Template[];
  activeWorkoutAssignment: ActiveWorkoutAssignment | null;
  workoutTemplates: Template[];
  logs: ProgressLog[];
  photos: ProgressPhoto[];
}) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || "");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [assignState, setAssignState] = useState<"idle" | "saving">("idle");
  const [endState, setEndState] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState("");

  const [selectedWorkoutTemplate, setSelectedWorkoutTemplate] = useState(workoutTemplates[0]?.id || "");
  const [workoutStartDate, setWorkoutStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [workoutAssignState, setWorkoutAssignState] = useState<"idle" | "saving">("idle");
  const [workoutEndState, setWorkoutEndState] = useState<"idle" | "saving">("idle");
  const [workoutError, setWorkoutError] = useState("");

  async function handleAssign() {
    setError("");
    if (!selectedTemplate) return setError("Pick a template first.");
    setAssignState("saving");
    const res = await fetch("/api/trainer/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, meal_plan_id: selectedTemplate, start_date: startDate }),
    });
    const data = await res.json();
    setAssignState("idle");
    if (!data.ok) return setError(data.error || "Could not assign the plan.");
    router.refresh();
  }

  async function handleEndPlan() {
    if (!activeAssignment) return;
    setEndState("saving");
    const res = await fetch(`/api/trainer/assignments/${activeAssignment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    const data = await res.json();
    setEndState("idle");
    if (!data.ok) return setError(data.error || "Could not end the plan.");
    router.refresh();
  }

  async function handleAssignWorkout() {
    setWorkoutError("");
    if (!selectedWorkoutTemplate) return setWorkoutError("Pick a template first.");
    setWorkoutAssignState("saving");
    const res = await fetch("/api/trainer/workout-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, workout_plan_id: selectedWorkoutTemplate, start_date: workoutStartDate }),
    });
    const data = await res.json();
    setWorkoutAssignState("idle");
    if (!data.ok) return setWorkoutError(data.error || "Could not assign the plan.");
    router.refresh();
  }

  async function handleEndWorkoutPlan() {
    if (!activeWorkoutAssignment) return;
    setWorkoutEndState("saving");
    const res = await fetch(`/api/trainer/workout-assignments/${activeWorkoutAssignment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    const data = await res.json();
    setWorkoutEndState("idle");
    if (!data.ok) return setWorkoutError(data.error || "Could not end the plan.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-line bg-panel p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">Diet Plan</span>
          {activeAssignment && (
            <button
              onClick={handleEndPlan}
              disabled={endState === "saving"}
              className="text-xs font-bold text-muted hover:text-ink disabled:opacity-60"
            >
              {endState === "saving" ? "Ending…" : "End plan"}
            </button>
          )}
        </div>

        {activeAssignment?.plan ? (
          <div>
            <p className="mb-1 text-base font-bold text-ink">{activeAssignment.plan.title}</p>
            <p className="mb-3 text-xs text-muted">
              Since {formatDate(activeAssignment.start_date)}
              {activeAssignment.end_date && ` · ends ${formatDate(activeAssignment.end_date)}`}
            </p>
            <div className="flex flex-col gap-3">
              {groupByMeal(activeAssignment.plan.meal_plan_items).map((group) => (
                <div key={group.type}>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold">{group.type}</p>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item, i) => (
                      <li key={i} className="text-sm text-ink">
                        {item.name}
                        {item.calories != null && <span className="text-muted"> — {item.calories} kcal</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted">No active plan.</p>
        )}

        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Assign a plan</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {templates.length === 0 && <option value="">No templates yet</option>}
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            />
            <button
              onClick={handleAssign}
              disabled={assignState === "saving" || templates.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-paper disabled:opacity-60"
            >
              {assignState === "saving" ? "Assigning…" : "Assign"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">Workout Plan</span>
          {activeWorkoutAssignment && (
            <button
              onClick={handleEndWorkoutPlan}
              disabled={workoutEndState === "saving"}
              className="text-xs font-bold text-muted hover:text-ink disabled:opacity-60"
            >
              {workoutEndState === "saving" ? "Ending…" : "End plan"}
            </button>
          )}
        </div>

        {activeWorkoutAssignment?.plan ? (
          <div>
            <p className="mb-1 text-base font-bold text-ink">{activeWorkoutAssignment.plan.title}</p>
            <p className="mb-3 text-xs text-muted">
              Since {formatDate(activeWorkoutAssignment.start_date)}
              {activeWorkoutAssignment.end_date && ` · ends ${formatDate(activeWorkoutAssignment.end_date)}`}
            </p>
            <div className="flex flex-col gap-3">
              {groupByDay(activeWorkoutAssignment.plan.workout_plan_exercises).map((group) => (
                <div key={group.day}>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold">{group.day}</p>
                  <ul className="flex flex-col gap-1">
                    {group.exercises.map((ex, i) => (
                      <li key={i} className="text-sm text-ink">
                        {ex.name}
                        {(ex.sets || ex.reps) && (
                          <span className="text-muted"> — {[ex.sets && `${ex.sets} sets`, ex.reps && `${ex.reps} reps`].filter(Boolean).join(" · ")}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted">No active plan.</p>
        )}

        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Assign a plan</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedWorkoutTemplate}
              onChange={(e) => setSelectedWorkoutTemplate(e.target.value)}
              className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {workoutTemplates.length === 0 && <option value="">No templates yet</option>}
              {workoutTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <input
              type="date"
              value={workoutStartDate}
              onChange={(e) => setWorkoutStartDate(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            />
            <button
              onClick={handleAssignWorkout}
              disabled={workoutAssignState === "saving" || workoutTemplates.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-paper disabled:opacity-60"
            >
              {workoutAssignState === "saving" ? "Assigning…" : "Assign"}
            </button>
          </div>
          {workoutError && <p className="mt-2 text-xs text-red-400">{workoutError}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6">
        <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">Progress — Measurements</span>
        {logs.length === 0 ? (
          <p className="text-sm text-muted">No entries logged yet.</p>
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

      <div className="rounded-2xl border border-line bg-panel p-6">
        <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-muted">Progress — Photos</span>
        {photos.length === 0 ? (
          <p className="text-sm text-muted">No photos uploaded yet.</p>
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
    </div>
  );
}
