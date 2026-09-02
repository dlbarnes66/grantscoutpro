"use client";

import React, { useEffect, useState } from "react";

export function TrialBanner({ workspaceId }: { workspaceId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/trial/status`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        setData(null);
      }
    }
    load();
  }, [workspaceId]);

  if (!data || !data.trialActive) return null;

  const end = new Date(data.trialEndsAt);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 p-3 text-center text-sm text-black">
      <strong>Trial Active</strong> — {daysLeft} days remaining
    </div>
  );
}
