"use client";

import React from "react";
import Link from "next/link";

interface AIAssistantPanelProps {
  workspaceName?: string;
  aiUsageTokens?: number;
  aiUsageCost?: number;
}

export function AIAssistantPanel({
  workspaceName,
  aiUsageTokens,
  aiUsageCost,
}: AIAssistantPanelProps) {
  const tokens = aiUsageTokens ?? 0;
  const cost = aiUsageCost ?? 0;

  return (
    <div className="rounded-lg border border-blue-500/40 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs font-semibold text-blue-200">
            AI workspace assistant
          </div>
          <div className="text-[11px] text-slate-400">
            {workspaceName ?? "Active workspace"} • tokens used: {tokens} • est. cost: $
            {cost.toFixed(2)}
          </div>
        </div>
        <Link
          href="/dashboard/ai"
          className="text-[11px] rounded border border-blue-500/60 px-2 py-1 text-blue-100 hover:bg-blue-500/20"
        >
          Open AI console
        </Link>
      </div>

      <div className="mt-2 text-[11px] text-slate-300">
        Use the AI console to analyze grants, generate narratives, score opportunities, and
        track usage across your enterprise workspace. All actions are logged to your
        workspace activity and AI usage history.
      </div>
    </div>
  );
}
