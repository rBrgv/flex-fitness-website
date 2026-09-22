import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionTrainer } from "@/lib/trainerSession";
import { WorkoutPlanEditor } from "@/components/WorkoutPlanEditor";

export default async function NewWorkoutPlanPage() {
  const trainer = await getSessionTrainer();
  if (!trainer) redirect("/trainer/login");

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">New Workout Plan Template</h1>
          <p className="mb-2 text-sm">
            <Link href="/trainer/workout-plans" className="font-bold text-muted hover:text-ink">← Templates</Link>
          </p>
        </div>
        <WorkoutPlanEditor plan={null} exercises={[]} />
      </div>
    </main>
  );
}
