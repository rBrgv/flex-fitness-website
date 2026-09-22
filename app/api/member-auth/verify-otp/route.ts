import { NextRequest, NextResponse, after } from "next/server";
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

  // otp and member lookups are independent (both keyed only on phone) —
  // run them in parallel instead of one after another. Costs one extra
  // query on a wrong-code attempt, but that's free (parallel) and saves a
  // full round-trip on every successful login, the far more common path.
  const [{ data: otp }, { data: member }] = await Promise.all([
    supabase
      .from("otp_codes")
      .select("id, code_hash, attempts, expires_at")
      .eq("phone", phone)
      .eq("purpose", "member")
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("members").select("id, status").eq("phone", phone).maybeSingle(),
  ]);

  const valid = otp && otp.attempts < OTP_MAX_ATTEMPTS && new Date(otp.expires_at) >= new Date()
    && otpMatches(otp.code_hash, phone, code, "member");
  if (!valid) {
    if (otp) {
      const attempts = otp.attempts + 1;
      // after() — not a bare fire-and-forget promise — so this still runs
      // to completion even though Vercel may freeze the function shortly
      // after the response below is sent.
      after(() => supabase.from("otp_codes").update({ attempts, verified: attempts >= OTP_MAX_ATTEMPTS }).eq("id", otp.id));
    }
    after(() => recordAuthEvent(supabase, { portal: "member", eventType: "otp_verify_failed", phone, success: false, request: req }));
    return NextResponse.json({ ok: false, error: "That code is incorrect or has expired." }, { status: 401 });
  }

  if (!member || member.status === "cancelled") {
    return NextResponse.json({ ok: false, error: "That code is incorrect or has expired." }, { status: 401 });
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const { error: sessionError } = await supabase
    .from("member_sessions")
    .insert({ member_id: member.id, token: `hashed:${crypto.randomUUID()}`, token_hash: hashSessionToken(token), expires_at: expiresAt });
  if (sessionError) {
    return NextResponse.json({ ok: false, error: "Could not start your session — please try again." }, { status: 500 });
  }

  // Neither of these needs to block the response — same reasoning as above.
  after(() => supabase.from("otp_codes").update({ verified: true }).eq("id", otp.id));
  after(() => recordAuthEvent(supabase, { portal: "member", eventType: "login_succeeded", phone, success: true, request: req }));

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
