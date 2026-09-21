import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionTrainer } from "@/lib/trainerSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { TrainerLogoutButton } from "@/components/TrainerLogoutButton";

type MemberRow = {
  id: string;
  name: string;
  phone: string;
  status: string;
};

export default async function TrainerClientsPage() {
  const trainer = await getSessionTrainer();
  if (!trainer) redirect("/trainer/login");

  const supabase = getSupabaseServer();
  const { data: members } = await supabase
    .from("members")
    .select("id, name, phone, status")
    .eq("trainer_id", trainer.id)
    .order("name", { ascending: true });

  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">My Clients</h1>
            <p className="text-sm text-muted">Members assigned to you</p>
          </div>
          <TrainerLogoutButton />
        </div>

        <p className="mb-4 text-sm">
          <Link href="/trainer" className="font-bold text-muted hover:text-ink">← Schedule</Link>
        </p>

        {(members as MemberRow[] | null)?.length ? (
          <div className="flex flex-col gap-3">
            {(members as MemberRow[]).map((m) => (
              <Link
                key={m.id}
                href={`/trainer/clients/${m.id}`}
                className="flex items-center justify-between rounded-lg border border-line bg-panel p-4 hover:border-accent"
              >
                <div>
                  <p className="text-base font-bold text-ink">{m.name}</p>
                  <p className="text-xs text-muted">{m.phone}</p>
                </div>
                <span className="text-xs font-bold uppercase text-muted">{m.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
            No members assigned to you right now.
          </p>
        )}
      </div>
    </main>
  );
}
