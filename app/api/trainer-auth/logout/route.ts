import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { hashSessionToken } from "@/lib/portalAuth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("flex_trainer_session")?.value;
  if (token) {
    const supabase = getSupabaseServer();
    await supabase.from("trainer_sessions").delete().or(`token.eq.${token},token_hash.eq.${hashSessionToken(token)}`);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("flex_trainer_session");
  return res;
}
