"use client";

import { useEffect, useState } from "react";

export default function TrialBanner({ workspaceId }: { workspaceId: string }) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/trial/status?workspaceId=${workspaceId}`);
      const json = await res.json();
      setDaysLeft(json.daysLeft);
    }
    load();
  }, [workspaceId]);

  if (daysLeft === null || daysLeft > 7) return null;

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-md mb-4">
      <p className="text-yellow-800 font-medium">
        Your trial ends in <strong>{daysLeft}</strong> days.  
        Please upgrade to avoid losing access.
      </p>
    </div>
  );
}
