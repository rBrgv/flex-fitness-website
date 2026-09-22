import { NextRequest, NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { bookClass } from "@/lib/classBooking";

export async function POST(req: NextRequest) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { class_id, date } = await req.json();
  if (!class_id || !date) {
    return NextResponse.json({ ok: false, error: "class_id and date are required." }, { status: 400 });
  }

  const result = await bookClass(member, class_id, date);
  if (result.error) return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: 400 });
  return NextResponse.json({ ok: true, ...result });
}
