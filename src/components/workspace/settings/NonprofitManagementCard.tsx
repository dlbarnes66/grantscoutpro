"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Nonprofit Management is a separate app that signs in with the same account.
// This card links to it when the workspace has the addon, or to Billing to add
// it. It renders nothing until NEXT_PUBLIC_NONPROFIT_OS_URL is set.
const APP_URL = process.env.NEXT_PUBLIC_NONPROFIT_OS_URL?.replace(/\/+$/, "") || null;

export default function NonprofitManagementCard({ workspaceId }: { workspaceId: string }) {
  const [state, setState] = useState<"loading" | "active" | "inactive" | "hidden">("loading");

  useEffect(() => {
    if (!APP_URL) {
      setState("hidden");
      return;
    }
    let cancelled = false;
    fetch(`/api/workspaces/${workspaceId}/billing`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const active = (json?.addons ?? []).some((a: any) => a.addonType === "nonprofit" && a.active);
        setState(active ? "active" : "inactive");
      })
      .catch(() => !cancelled && setState("inactive"));
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (state === "hidden" || state === "loading") return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">Nonprofit Management</p>
          <p className="mt-1 text-xs text-slate-400">
            Compliance calendar, document vault, board approvals and tasks, signed in with this same account.
          </p>
        </div>
        <span
          className={
            state === "active"
              ? "rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-medium text-emerald-300"
              : "rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300"
          }
        >
          {state === "active" ? "Active" : "Add-on"}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        {state === "active" ? (
          <a
            href={APP_URL!}
            className="rounded bg-[#F5C542] px-3 py-1.5 text-sm font-semibold text-[#071633]"
          >
            Open Nonprofit Management
          </a>
        ) : (
          <Link
            href={`/workspace/${workspaceId}/workspace-billing`}
            className="rounded border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-400"
          >
            Add in Billing
          </Link>
        )}
      </div>
    </div>
  );
}
