import { NextRequest, NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { requestFreeze } from "@/lib/freezeRequest";

export async function POST(req: NextRequest) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { reason } = await req.json();
  const result = await requestFreeze(member, reason || null);
  if (result.error) return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
