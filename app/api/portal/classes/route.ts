import { NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { listBookableClasses } from "@/lib/classBooking";

export async function GET() {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const { enabled, classes } = await listBookableClasses(member);
  return NextResponse.json({ ok: true, enabled, classes });
}
