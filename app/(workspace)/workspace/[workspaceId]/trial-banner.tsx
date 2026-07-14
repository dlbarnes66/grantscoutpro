"use client";

import useSWR from "swr";

export function TrialBanner({ workspaceId }: { workspaceId: string }) {
  const { data } = useSWR(`/api/workspaces/${workspaceId}/trial/status`);

  if (!data || !data.trialActive) return null;

  const end = new Date(data.trialEndsAt);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 p-3 text-center text-sm">
      <strong>Trial Active</strong> — {daysLeft} days remaining
    </div>
  );
}
