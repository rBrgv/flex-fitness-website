import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("flex_session")?.value;
  if (token) {
    const supabase = getSupabaseServer();
    await supabase.from("member_sessions").delete().eq("token", token);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("flex_session");
  return res;
}
