import { getSupabaseServer } from "./supabaseServer";

const BUCKET = "facility-issue-photos";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

type Member = { id: string; phone: string };

// Mirrors flex-fitness-whatsapp-bot/lib/facilityReports.js's captureReport
// — same table, same public bucket (no signed URL needed, this bucket is
// already public — unlike progress-photos). A Supabase Database Webhook
// on facility_issues INSERT/UPDATE already fires regardless of source, so
// urgent escalation works for a web/app-submitted report with no new
// plumbing.
export async function submitFacilityReport(
  member: Member,
  { description, severity, photoFile }: { description: string | null; severity: "normal" | "urgent"; photoFile?: File | null }
) {
  const supabase = getSupabaseServer();
  let photoUrl: string | null = null;

  if (photoFile) {
    if (!ALLOWED_TYPES.includes(photoFile.type)) {
      return { error: "invalid_file", message: "Photo must be JPEG, PNG, or WebP." };
    }
    if (photoFile.size > MAX_BYTES) {
      return { error: "file_too_large", message: "Photo must be 10MB or smaller." };
    }
    const ext = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${member.phone}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await photoFile.arrayBuffer()), { contentType: photoFile.type });
    if (uploadError) return { error: "upload_failed", message: "Could not upload the photo." };
    photoUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const { error: insertError } = await supabase.from("facility_issues").insert({
    phone: member.phone,
    member_id: member.id,
    description: description || null,
    photo_url: photoUrl,
    severity,
  });
  if (insertError) return { error: "insert_failed", message: insertError.message };

  return { success: true, hasPhoto: !!photoUrl };
}
