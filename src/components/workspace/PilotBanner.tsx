"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface PilotInfo {
  tier: string | null;
  active: boolean;
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
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/org/billing");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.pilot) setPilot(json.pilot);
      } catch {
        // Silent - a failed check just means no banner, not a broken page.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!pilot || !pilot.warning || dismissed) return null;

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
        Your {tierLabel} pilot ends in {days} day{days === 1 ? "" : "s"}. After that, this workspace drops back to
        the Basic plan unless you upgrade.
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
