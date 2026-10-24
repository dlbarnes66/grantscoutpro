"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface PilotInfo {
  tier: string | null;
  active: boolean;
  isTrial?: boolean;
  daysRemaining: number | null;
  warning: boolean;
  endsAt: string | null;
}

// Shown across the workspace app once a comped pilot (see
// /api/admin/pilot) is within its warning window - 10 days out from
// pilotEndsAt (see PILOT_WARNING_WINDOW_DAYS in src/lib/plans.ts).
// Dismissible per browser tab only; it comes back on the next page
// load/session since the countdown is still real.
export default function PilotBanner() {
  const [pilot, setPilot] = useState<PilotInfo | null>(null);
  const [org, setOrg] = useState<{ tier: string | null; stripeSubscriptionId: string | null } | null>(null);
  const [trial, setTrial] = useState<{ discountOffered: boolean; discountPercent: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/org/billing");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.pilot) setPilot(json.pilot);
        if (!cancelled && json?.org) setOrg(json.org);
        if (!cancelled && json?.trial) setTrial(json.trial);
      } catch {
        // Silent - a failed check just means no banner, not a broken page.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!pilot || dismissed) return null;

  // Someone who has subscribed no longer needs trial messaging.
  if (pilot.isTrial && org?.stripeSubscriptionId) return null;

  const trialEnded =
    !!pilot.isTrial &&
    !pilot.active &&
    !!org &&
    !org.stripeSubscriptionId &&
    (!org.tier || org.tier === "basic" || org.tier === "free");
  const trialRunning = !!pilot.isTrial && pilot.active;

  // A running trial is always visible; a comped pilot only inside its
  // warning window (as before); an ended trial until they subscribe.
  if (!trialRunning && !trialEnded && !pilot.warning) return null;

  const tierLabel = pilot.tier ? pilot.tier.charAt(0).toUpperCase() + pilot.tier.slice(1) : "pilot";
  const days = pilot.daysRemaining ?? 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 8,
        border: "1px solid rgba(245,158,11,0.35)",
        background: "rgba(245,158,11,0.08)",
        color: "#FBBF24",
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>
        {trialEnded ? (
          <>
            Your 14-day free trial has ended and this account is locked until you subscribe.{" "}
            <a href="/billing" style={{ color: "inherit", textDecoration: "underline" }}>
              Choose a plan
            </a>{" "}
            to get your account back.
          </>
        ) : trialRunning ? (
          <>
            Free trial: you have full {tierLabel} access for {days} more day{days === 1 ? "" : "s"}.{" "}
            {trial?.discountOffered ? (
              <>
                Subscribe now and take {trial.discountPercent}% off.{" "}
                <a href="/billing" style={{ color: "inherit", textDecoration: "underline" }}>
                  Claim the discount
                </a>
              </>
            ) : (
              <>
                <a href="/billing" style={{ color: "inherit", textDecoration: "underline" }}>
                  Choose a plan
                </a>{" "}
                any time to keep it.
              </>
            )}
          </>
        ) : (
          <>
            Your {tierLabel} pilot ends in {days} day{days === 1 ? "" : "s"}. After that, this workspace drops back to
            the Basic plan unless you upgrade.
          </>
        )}
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: "none", border: "none", color: "#FBBF24", cursor: "pointer", fontSize: 13 }}
      >
        Dismiss
      </button>
    </div>
  );
}
