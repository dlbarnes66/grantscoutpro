import React from "react";
import { auth } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AiHomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Load workspace
  const workspace = userId
    ? await prisma.workspace.findFirst({
        where: { members: { some: { userId } } },
        include: {
          aiUsage: true,
          activities: true
        }
      })
    : null;

  if (!workspace) {
    return (
      <div className="text-slate-300 text-sm">
        No workspace found. Please join or create a workspace.
      </div>
    );
  }

  // Safe fallback: compute AI usage directly from Prisma
  const tokensUsed = workspace.aiUsage.reduce((sum, u) => sum + u.tokens, 0);
  const cost = workspace.aiUsage.reduce((sum, u) => sum + u.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xl font-semibold text-slate-100">
          AI Workspace Console
        </div>
        <div className="text-sm text-slate-400">
          AI tools for analysis, scoring, rewriting, drafting, and intelligence.
        </div>
      </div>

      {/* Usage Summary */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="text-sm font-semibold text-slate-100 mb-2">
          AI Usage Summary
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="rounded border border-slate-800/60 bg-slate-900/60 p-3">
            <div className="text-slate-400">Tokens used</div>
            <div className="text-lg font-semibold text-slate-100">
              {tokensUsed}
            </div>
          </div>
          <div className="rounded border border-slate-800/60 bg-slate-900/60 p-3">
            <div className="text-slate-400">Estimated cost</div>
            <div className="text-lg font-semibold text-slate-100">
              ${cost.toFixed(2)}
            </div>
          </div>
          <div className="rounded border border-slate-800/60 bg-slate-900/60 p-3">
            <div className="text-slate-400">Recent actions</div>
            <div className="text-lg font-semibold text-slate-100">
              {workspace.activities.length}
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools */}
      <div className="grid md:grid-cols-3 gap-4 text-xs">
        {[
          { label: "Analyzer", href: "/dashboard/ai/analyzer" },
          { label: "Eligibility", href: "/dashboard/ai/eligibility" },
          { label: "Matching", href: "/dashboard/ai/matching" },
          { label: "Summary", href: "/dashboard/ai/summary" },
          { label: "Rewrite", href: "/dashboard/ai/rewrite" },
          { label: "Outline", href: "/dashboard/ai/outline" },
          { label: "Proposal", href: "/dashboard/ai/proposal" },
          { label: "Editor", href: "/dashboard/ai/editor" },
          { label: "Templates", href: "/dashboard/ai/templates" },
          { label: "Automations", href: "/dashboard/ai/automations" },
          { label: "History", href: "/dashboard/ai/history" },
          { label: "Usage", href: "/dashboard/ai/usage" },
          { label: "Writer", href: "/dashboard/ai/writer" }
        ].map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900"
          >
            <div className="text-slate-100 font-semibold">{tool.label}</div>
            <div className="text-slate-400 mt-1">
              AI‑powered {tool.label.toLowerCase()} tool.
            </div>
          </Link>
        ))}
      </div>

      {/* Recent AI Logs */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="text-sm font-semibold text-slate-100 mb-2">
          Recent AI Actions
        </div>
        {workspace.activities.length === 0 ? (
          <div className="text-slate-400 text-xs">No AI actions yet.</div>
        ) : (
          <div className="space-y-2 text-xs">
            {workspace.activities.map((log) => (
              <div
                key={log.id}
                className="rounded border border-slate-800/60 bg-slate-900/60 px-3 py-2"
              >
                <div className="text-slate-200 font-medium">{log.action}</div>
                <div className="text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
