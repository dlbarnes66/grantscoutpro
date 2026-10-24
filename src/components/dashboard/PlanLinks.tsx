"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Puzzle, CreditCard } from "lucide-react";

// Sidebar shortcuts for plan and add-on management on the dashboard pages.
// The plan belongs to the whole account (/billing). Add-ons are bought per
// workspace, so that link opens the add-ons section of the most recent
// workspace; with no workspace yet it goes to the workspace picker.
export default function PlanLinks() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) return;
        const json = await res.json();
        const first = json?.workspaces?.[0]?.id;
        if (!cancelled && first) setWorkspaceId(first);
      } catch {
        // Links still work without it - add-ons falls back to the picker.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addonsHref = workspaceId ? `/workspace/${workspaceId}/workspace-billing` : "/workspace";

  return (
    <div className="mb-4 flex flex-col gap-2">
      <Link
        href="/billing"
        className="flex items-center justify-center gap-2 rounded-lg bg-[#F5C542] px-3 py-2 text-sm font-bold text-[#071633] hover:brightness-95"
      >
        <Sparkles size={15} />
        Upgrade plan
      </Link>
      <Link href="/billing" className="flex items-center gap-2 px-1 text-sm text-slate-300 hover:text-white">
        <CreditCard size={14} />
        Billing &amp; plan
      </Link>
      <Link href={addonsHref} className="flex items-center gap-2 px-1 text-sm text-slate-300 hover:text-white">
        <Puzzle size={14} />
        Add-ons
      </Link>
    </div>
  );
}
