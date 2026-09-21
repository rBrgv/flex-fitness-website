import { NextRequest, NextResponse } from "next/server";
import { getSessionMember } from "@/lib/memberSession";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { todayInGymTimezone } from "@/lib/dateUtils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const VIEW_TYPES = ["front", "side", "back", "other"];

export async function POST(req: NextRequest) {
  const member = await getSessionMember();
  if (!member) return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "A photo file is required." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "Photo must be JPEG, PNG, or WebP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Photo must be 8MB or smaller." }, { status: 400 });
  }

  const viewTypeRaw = String(form.get("view_type") || "front");
  const view_type = VIEW_TYPES.includes(viewTypeRaw) ? viewTypeRaw : "front";
  const log_date = String(form.get("date") || todayInGymTimezone());
  const notes = form.get("notes") ? String(form.get("notes")) : null;
  const is_milestone = String(form.get("is_milestone") || "false") === "true";

  const supabase = getSupabaseServer();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${member.id}/${Date.now()}-${view_type}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("progress-photos")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (uploadError) {
    return NextResponse.json({ ok: false, error: "Could not upload the photo." }, { status: 500 });
  }

  const { data: photo, error: insertError } = await supabase
    .from("progress_photos")
    .insert({ member_id: member.id, storage_path: path, log_date, view_type, notes, is_milestone })
    .select()
    .single();

  if (insertError || !photo) {
    // Clean up the orphaned storage object — no dangling file without a DB row.
    await supabase.storage.from("progress-photos").remove([path]);
    return NextResponse.json({ ok: false, error: "Could not save the photo record." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: photo.id });
}
