"use client";

import React from "react";

interface TrialBannerProps {
  trialActive?: boolean;
  trialDaysRemaining?: number | null;
  trialLocked?: boolean;
  subscriptionTier?: string | null;
}

export function TrialBanner({
  trialActive,
  trialDaysRemaining,
  trialLocked,
  subscriptionTier,
}: TrialBannerProps) {
  if (!trialActive && !trialLocked) return null;

  const days = trialDaysRemaining ?? 0;
  const tier = subscriptionTier ?? "basic";

  return (
    <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-xs text-amber-100">
      {trialLocked ? (
        <div className="font-semibold">
          Trial locked — upgrade your workspace to continue using AI features.
        </div>
      ) : (
        <div className="font-semibold">
          Trial active ({tier} tier) — {days} day{days === 1 ? "" : "s"} remaining.
        </div>
      )}
      <div className="mt-1 text-amber-200/80">
        Your workspace billing and seats are managed at the organization level. Enterprise
        workspaces can unlock unlimited users and AI usage.
      </div>
    </div>
  );
}
