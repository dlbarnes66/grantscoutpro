"use client";

import { useState } from "react";

const ORG_TYPES = [
  "Nonprofit",
  "Veteran-owned business",
  "Small business",
  "Grant consultant or writer",
  "Other",
];

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 16,
  fontFamily: "inherit",
  boxSizing: "border-box",
};
const label: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, color: "#E2E8F0", marginBottom: 6 };
const hint: React.CSSProperties = { fontWeight: 400, color: "#94A3B8" };

export default function PilotForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setError("");
    setStatus("sending");

    const f = new FormData(e.currentTarget);
    const payload = {
      name: f.get("name"),
      email: f.get("email"),
      organization: f.get("organization"),
      role: f.get("role"),
      orgType: f.get("orgType"),
      website: f.get("website"),
      state: f.get("state"),
      challenge: f.get("challenge"),
      feedbackConsent: f.get("feedbackConsent") === "on",
      company_url: f.get("company_url"), // honeypot
    };

    try {
      const res = await fetch("/api/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network problem. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div role="status" style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>✓</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>Application received</h2>
        <p style={{ color: "#CBD5E1", fontSize: 16, lineHeight: 1.6, margin: "0 0 20px" }}>
          Thanks for applying. We&apos;re choosing about 10 pilot users and will email you either way. Check your inbox for a confirmation.
          If you&apos;re selected, create your free account with the same email so we can activate your access quickly.
        </p>
        <a href="/sign-up" style={{ color: "#5FE3FF", fontWeight: 600 }}>Create your account now →</a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div>
          <label htmlFor="name" style={label}>Your name</label>
          <input id="name" name="name" required maxLength={120} autoComplete="name" style={input} />
        </div>
        <div>
          <label htmlFor="email" style={label}>Email</label>
          <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" style={input} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div>
          <label htmlFor="organization" style={label}>Organization</label>
          <input id="organization" name="organization" required maxLength={160} autoComplete="organization" style={input} />
        </div>
        <div>
          <label htmlFor="role" style={label}>Your role</label>
          <input id="role" name="role" required maxLength={120} placeholder="e.g. Executive Director" autoComplete="organization-title" style={input} />
        </div>
      </div>

      <div>
        <label htmlFor="orgType" style={label}>Organization type</label>
        <select id="orgType" name="orgType" required defaultValue="" style={input}>
          <option value="" disabled>Choose one</option>
          {ORG_TYPES.map((t) => (
            <option key={t} value={t} style={{ color: "#000" }}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div>
          <label htmlFor="website" style={label}>Website <span style={hint}>(optional)</span></label>
          <input id="website" name="website" maxLength={300} placeholder="yourorg.org" autoComplete="url" style={input} />
        </div>
        <div>
          <label htmlFor="state" style={label}>State <span style={hint}>(optional)</span></label>
          <input id="state" name="state" maxLength={60} placeholder="e.g. Alabama" autoComplete="address-level1" style={input} />
        </div>
      </div>

      <div>
        <label htmlFor="challenge" style={label}>What&apos;s your biggest grant challenge right now?</label>
        <textarea id="challenge" name="challenge" required rows={4} maxLength={1000} style={{ ...input, resize: "vertical" }} />
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
        <label htmlFor="company_url">Leave this field empty</label>
        <input id="company_url" name="company_url" tabIndex={-1} autoComplete="off" />
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "#CBD5E1", fontSize: 14, lineHeight: 1.5 }}>
        <input type="checkbox" name="feedbackConsent" required style={{ marginTop: 3, width: 18, height: 18 }} />
        <span>
          The pilot is free. In return I&apos;m happy to share honest feedback and be contacted by email for a short follow-up.
        </span>
      </label>

      {error && (
        <p role="alert" style={{ color: "#FCA5A5", fontSize: 14, margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          padding: "14px 24px",
          borderRadius: 12,
          border: "none",
          background: "#D9B061",
          color: "#1A1405",
          fontSize: 17,
          fontWeight: 700,
          cursor: status === "sending" ? "wait" : "pointer",
          opacity: status === "sending" ? 0.7 : 1,
        }}
      >
        {status === "sending" ? "Sending…" : "Apply for the free pilot"}
      </button>
    </form>
  );
}
