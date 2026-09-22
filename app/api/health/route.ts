import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase.from("members").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;

    return NextResponse.json({
      status: "ok",
      database: "reachable",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", database: "unreachable", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
