import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

const OTP_COOLDOWN_MS = 60_000;
const OTP_TTL_MS = 5 * 60_000;

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!/^\d{10,15}$/.test(phone || "")) {
    return NextResponse.json({ ok: false, error: "Enter a valid phone number." }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  // Only registered members can log in — this is a member portal, not open signup.
  const { data: member } = await supabase.from("members").select("id, status").eq("phone", phone).maybeSingle();
  if (!member) {
    return NextResponse.json(
      { ok: false, error: "This number isn't registered as a member. Contact the gym if you think this is a mistake." },
      { status: 404 }
    );
  }

  // Cooldown — avoid hammering WhatsApp sends for the same number.
  const { data: recent } = await supabase
    .from("otp_codes")
    .select("created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent && Date.now() - new Date(recent.created_at).getTime() < OTP_COOLDOWN_MS) {
    return NextResponse.json({ ok: false, error: "Please wait a moment before requesting another code." }, { status: 429 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { error: insertError } = await supabase.from("otp_codes").insert({ phone, code, expires_at: expiresAt });
  if (insertError) {
    return NextResponse.json({ ok: false, error: "Could not generate a code — please try again." }, { status: 500 });
  }

  try {
    const botRes = await fetch(`${process.env.BOT_URL}/internal/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Member-Auth-Secret": process.env.MEMBER_AUTH_SECRET || "" },
      body: JSON.stringify({ phone, code }),
    });
    if (!botRes.ok) throw new Error(`Bot responded ${botRes.status}`);
  } catch {
    return NextResponse.json({ ok: false, error: "Could not send the code — please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
