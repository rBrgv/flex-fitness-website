import "server-only";

import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type PortalKind = "member" | "trainer";

export const OTP_COOLDOWN_MS = 60_000;
export const OTP_TTL_MS = 5 * 60_000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_SENDS_PER_HOUR = 5;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60_000;

export const GENERIC_OTP_RESPONSE = {
  ok: true,
  message: "If this number is registered, a login code will arrive on WhatsApp shortly.",
};

function requiredSecret(name: "AUTH_PEPPER") {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} must be configured with at least 32 characters`);
  }
  return value;
}

export function normalizePhone(value: unknown) {
  if (typeof value !== "string") return null;
  const phone = value.replace(/\D/g, "");
  return /^\d{10,15}$/.test(phone) ? phone : null;
}

export function normalizeOtp(value: unknown) {
  if (typeof value !== "string") return null;
  return /^\d{6}$/.test(value) ? value : null;
}

export function generateOtp() {
  return String(randomInt(100_000, 1_000_000));
}

export function hashOtp(phone: string, code: string, purpose: PortalKind) {
  return createHmac("sha256", requiredSecret("AUTH_PEPPER"))
    .update(`${purpose}:${phone}:${code}`)
    .digest("hex");
}

export function otpMatches(expectedHash: string, phone: string, code: string, purpose: PortalKind) {
  const actual = Buffer.from(hashOtp(phone, code, purpose), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function readJsonObject(req: Request) {
  try {
    const value: unknown = await req.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function recordAuthEvent(
  supabase: SupabaseClient,
  event: {
    portal: PortalKind;
    eventType: string;
    phone?: string | null;
    success: boolean;
    request?: Request;
    metadata?: Record<string, unknown>;
  }
) {
  const forwardedFor = event.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = event.request?.headers.get("user-agent")?.slice(0, 500);

  // Audit logging must never turn a recoverable login failure into an outage.
  await supabase.from("auth_events").insert({
    portal: event.portal,
    event_type: event.eventType,
    phone: event.phone || null,
    success: event.success,
    ip_address: forwardedFor || null,
    user_agent: userAgent || null,
    metadata: event.metadata || {},
  });
}

export async function findSession<T extends "member" | "trainer">(
  supabase: SupabaseClient,
  table: T extends "member" ? "member_sessions" : "trainer_sessions",
  token: string,
  ownerColumn: T extends "member" ? "member_id" : "trainer_id"
) {
  const columns = `${ownerColumn}, expires_at`;
  const digest = hashSessionToken(token);
  const { data: hashed } = await supabase
    .from(table)
    .select(columns)
    .eq("token_hash", digest)
    .maybeSingle();

  if (hashed) return hashed as unknown as Record<string, string>;

  // Temporary compatibility for sessions created before token hashing shipped.
  const { data: legacy } = await supabase.from(table).select(columns).eq("token", token).maybeSingle();
  return legacy as unknown as Record<string, string> | null;
}
