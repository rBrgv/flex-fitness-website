import { NextRequest, NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { submitFacilityReport } from "@/lib/facilityReport";

export async function POST(req: NextRequest) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const form = await req.formData();
  const description = form.get("description") ? String(form.get("description")) : null;
  const severity = form.get("severity") === "urgent" ? "urgent" : "normal";
  const photoFile = form.get("file");

  const result = await submitFacilityReport(member, {
    description,
    severity,
    photoFile: photoFile instanceof File ? photoFile : null,
  });
  if (result.error) return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: 400 });
  return NextResponse.json({ ok: true, ...result });
}
