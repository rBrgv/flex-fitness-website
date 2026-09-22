import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import {
  GENERIC_OTP_RESPONSE, OTP_COOLDOWN_MS, OTP_MAX_SENDS_PER_HOUR, OTP_TTL_MS,
  generateOtp, hashOtp, normalizePhone, readJsonObject, recordAuthEvent,
} from "@/lib/portalAuth";

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  const phone = normalizePhone(body?.phone);
  if (!phone) return NextResponse.json({ ok: false, error: "Enter a valid phone number." }, { status: 400 });

  const supabase = getSupabaseServer();

  const { data: trainer } = await supabase.from("trainers").select("id, active").eq("phone", phone).maybeSingle();
  if (!trainer || !trainer.active) {
    await recordAuthEvent(supabase, { portal: "trainer", eventType: "otp_rejected", phone, success: false, request: req });
    return NextResponse.json(GENERIC_OTP_RESPONSE);
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
  const [{ data: recent }, { count }] = await Promise.all([
    supabase.from("otp_codes").select("created_at").eq("phone", phone).eq("purpose", "trainer").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("otp_codes").select("id", { count: "exact", head: true }).eq("phone", phone).eq("purpose", "trainer").gte("created_at", oneHourAgo),
  ]);
  if (recent && Date.now() - new Date(recent.created_at).getTime() < OTP_COOLDOWN_MS) {
    return NextResponse.json({ ok: false, error: "Please wait a moment before requesting another code." }, { status: 429 });
  }
  if ((count || 0) >= OTP_MAX_SENDS_PER_HOUR) {
    await recordAuthEvent(supabase, { portal: "trainer", eventType: "otp_rate_limited", phone, success: false, request: req });
    return NextResponse.json({ ok: false, error: "Too many login attempts. Please try again later." }, { status: 429 });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  await supabase.from("otp_codes").update({ verified: true }).eq("phone", phone).eq("purpose", "trainer").eq("verified", false);

  const { data: otp, error: insertError } = await supabase
    .from("otp_codes")
    .insert({ phone, code: "hashed", code_hash: hashOtp(phone, code, "trainer"), purpose: "trainer", expires_at: expiresAt })
    .select("id")
    .single();
  if (insertError) {
    await recordAuthEvent(supabase, { portal: "trainer", eventType: "otp_create_failed", phone, success: false, request: req });
    return NextResponse.json({ ok: false, error: "Could not generate a code — please try again." }, { status: 500 });
  }

  try {
    const botRes = await fetch(`${process.env.BOT_URL}/internal/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Member-Auth-Secret": process.env.MEMBER_AUTH_SECRET || "" },
      body: JSON.stringify({ phone, code }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!botRes.ok) throw new Error(`Bot responded ${botRes.status}`);
  } catch {
    await supabase.from("otp_codes").delete().eq("id", otp.id);
    await recordAuthEvent(supabase, { portal: "trainer", eventType: "otp_send_failed", phone, success: false, request: req });
    return NextResponse.json({ ok: false, error: "Could not send the code — please try again." }, { status: 502 });
  }

  await recordAuthEvent(supabase, { portal: "trainer", eventType: "otp_sent", phone, success: true, request: req });
  return NextResponse.json(GENERIC_OTP_RESPONSE);
}
