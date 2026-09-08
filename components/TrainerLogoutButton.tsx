"use client";

import { useRouter } from "next/navigation";

export function TrainerLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/trainer-auth/logout", { method: "POST" });
    router.push("/trainer/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-xs text-muted hover:text-ink">
      Log out
    </button>
  );
}
