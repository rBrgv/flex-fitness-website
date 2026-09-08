import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSupabaseServer } from "@/lib/supabaseServer";

const SESSION_TTL_MS = 30 * 24 * 60 * 60_000; // 30 days

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();

  if (!/^\d{10,15}$/.test(phone || "") || !/^\d{6}$/.test(code || "")) {
    return NextResponse.json({ ok: false, error: "Invalid code." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: otp } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", phone)
    .eq("code", code)
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp || new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ ok: false, error: "That code is incorrect or has expired." }, { status: 401 });
  }

  const { data: member } = await supabase.from("members").select("id").eq("phone", phone).maybeSingle();
  if (!member) {
    return NextResponse.json({ ok: false, error: "This number isn't registered as a member." }, { status: 404 });
  }

  await supabase.from("otp_codes").update({ verified: true }).eq("id", otp.id);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const { error: sessionError } = await supabase
    .from("member_sessions")
    .insert({ member_id: member.id, token, expires_at: expiresAt });
  if (sessionError) {
    return NextResponse.json({ ok: false, error: "Could not start your session — please try again." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("flex_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
