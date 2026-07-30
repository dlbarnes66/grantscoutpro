"use client";

import React from "react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      label: "Search new grants",
      href: "/dashboard/search",
      description: "Run an AI‑assisted search across federal, state, and foundation opportunities.",
    },
    {
      label: "Analyze a grant",
      href: "/dashboard/ai/analyzer",
      description: "Send a grant into the AI analyzer for eligibility, risk, and competitiveness.",
    },
    {
      label: "Draft a proposal",
      href: "/dashboard/ai/proposal",
      description: "Use the AI writer to generate a first draft based on your workspace profile.",
    },
    {
      label: "Review portfolio",
      href: "/dashboard/recommendations",
      description: "See AI‑generated recommendations across your saved and active grants.",
    },
  ];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="text-sm font-semibold text-slate-100 mb-2">
        Quick actions
      </div>
      <div className="grid gap-2 text-xs text-slate-300">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col rounded-md border border-slate-800/60 bg-slate-900/60 px-3 py-2 hover:border-blue-500/60 hover:bg-slate-900"
          >
            <span className="font-medium text-slate-100 group-hover:text-blue-300">
              {action.label}
            </span>
            <span className="text-slate-400 group-hover:text-slate-300">
              {action.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
