import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import {
  OTP_MAX_ATTEMPTS, SESSION_TTL_MS, createSessionToken, hashSessionToken,
  normalizeOtp, normalizePhone, otpMatches, readJsonObject, recordAuthEvent,
} from "@/lib/portalAuth";

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  const phone = normalizePhone(body?.phone);
  const code = normalizeOtp(body?.code);
  if (!phone || !code) {
    return NextResponse.json({ ok: false, error: "Invalid code." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: otp } = await supabase
    .from("otp_codes")
    .select("id, code_hash, attempts, expires_at")
    .eq("phone", phone)
    .eq("purpose", "trainer")
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const valid = otp && otp.attempts < OTP_MAX_ATTEMPTS && new Date(otp.expires_at) >= new Date()
    && otpMatches(otp.code_hash, phone, code, "trainer");
  if (!valid) {
    if (otp) {
      const attempts = otp.attempts + 1;
      await supabase.from("otp_codes").update({ attempts, verified: attempts >= OTP_MAX_ATTEMPTS }).eq("id", otp.id);
    }
    await recordAuthEvent(supabase, { portal: "trainer", eventType: "otp_verify_failed", phone, success: false, request: req });
    return NextResponse.json({ ok: false, error: "That code is incorrect or has expired." }, { status: 401 });
  }

  const { data: trainer } = await supabase.from("trainers").select("id, active").eq("phone", phone).maybeSingle();
  if (!trainer || !trainer.active) {
    return NextResponse.json({ ok: false, error: "That code is incorrect or has expired." }, { status: 401 });
  }

  await supabase.from("otp_codes").update({ verified: true }).eq("id", otp.id);

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const { error: sessionError } = await supabase
    .from("trainer_sessions")
    .insert({ trainer_id: trainer.id, token: `hashed:${crypto.randomUUID()}`, token_hash: hashSessionToken(token), expires_at: expiresAt });
  if (sessionError) {
    return NextResponse.json({ ok: false, error: "Could not start your session — please try again." }, { status: 500 });
  }

  await recordAuthEvent(supabase, { portal: "trainer", eventType: "login_succeeded", phone, success: true, request: req });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("flex_trainer_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
