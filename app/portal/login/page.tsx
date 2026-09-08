"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/member-auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setStep("code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/member-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push("/portal");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="h-7 w-7 flex-none" aria-hidden="true">
            <path
              d="M4 6h9l3 6 3-6h9l-8 10 8 10h-9l-3-6-3 6H4l8-10Z"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display text-lg font-semibold uppercase leading-none tracking-tight text-ink">
            Flex <span className="text-gold">Fitness</span>
          </span>
        </div>

        {step === "phone" ? (
          <form onSubmit={requestOtp}>
            <h1 className="mb-1 text-lg font-bold text-ink">Member login</h1>
            <p className="mb-5 text-sm text-muted">Enter your phone number — we&apos;ll send a code on WhatsApp.</p>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="919XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
              className="mb-4 w-full rounded-lg border border-line bg-panel-raised px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-paper transition-opacity disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <h1 className="mb-1 text-lg font-bold text-ink">Enter your code</h1>
            <p className="mb-5 text-sm text-muted">Sent to {phone} on WhatsApp — expires in 5 minutes.</p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              maxLength={6}
              className="mb-4 w-full rounded-lg border border-line bg-panel-raised px-4 py-3 text-center text-lg tracking-[0.3em] text-ink placeholder:tracking-normal placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-paper transition-opacity disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Log in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
              }}
              className="mt-3 w-full text-center text-xs text-muted hover:text-ink"
            >
              Use a different number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
