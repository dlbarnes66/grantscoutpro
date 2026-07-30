import React from "react";
import { prisma } from "@/lib/prisma.ts";
import { getServerSession } from "next-auth";
import { loadWorkspaceIntelligence } from "./_lib/loadWorkspaceIntelligence";

export default async function WorkspaceIntelligencePage() {
  const session = await getServerSession();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return <div className="text-slate-300 text-sm">Not authenticated.</div>;
  }

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId } } },
  });

  if (!workspace) {
    return <div className="text-slate-300 text-sm">Workspace not found.</div>;
  }

  const data = await loadWorkspaceIntelligence(workspace.id);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="text-2xl font-semibold text-slate-100">
          Workspace Intelligence Hub
        </div>
        <div className="text-sm text-slate-400">
          Unified AI intelligence for your entire workspace.
        </div>
      </div>

      {/* Grants Overview */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          Grants Overview
        </div>

        {data.grants.length === 0 ? (
          <div className="text-xs text-slate-400">No grants found.</div>
        ) : (
          data.grants.map((g) => (
            <div
              key={g.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{g.title}</div>
              <div className="text-slate-400">{g.agency}</div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="text-blue-300">
                  Eligibility: {g.aiEligibilityScore ?? "N/A"}
                </div>
                <div className="text-red-300">
                  Risk: {g.aiRiskScore ?? "N/A"}
                </div>
                <div className="text-green-300">
                  Competitiveness: {g.aiCompetitivenessScore ?? "N/A"}
                </div>
              </div>

              {g.aiSummary && (
                <pre className="mt-2 text-[10px] text-blue-300">
                  {g.aiSummary}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      {/* Workspace Insights */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          Workspace Insights
        </div>

        {data.insights.length === 0 ? (
          <div className="text-xs text-slate-400">No insights yet.</div>
        ) : (
          data.insights.map((i) => (
            <div
              key={i.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{i.title}</div>
              <pre className="text-[10px] text-blue-300">{i.description}</pre>
            </div>
          ))
        )}
      </div>

      {/* Narratives */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          Narratives
        </div>

        {data.narratives.length === 0 ? (
          <div className="text-xs text-slate-400">No narratives yet.</div>
        ) : (
          data.narratives.map((n) => (
            <div
              key={n.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{n.style}</div>
              <pre className="text-[10px] text-blue-300">{n.content}</pre>
            </div>
          ))
        )}
      </div>

      {/* Proposals */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          Proposals
        </div>

        {data.proposals.length === 0 ? (
          <div className="text-xs text-slate-400">No proposals yet.</div>
        ) : (
          data.proposals.map((app) => (
            <div
              key={app.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{app.title}</div>
              {app.versions.map((v) => (
                <pre key={v.id} className="mt-2 text-[10px] text-blue-300">
                  {v.content}
                </pre>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Templates */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          Templates
        </div>

        {data.templates.length === 0 ? (
          <div className="text-xs text-slate-400">No templates yet.</div>
        ) : (
          data.templates.map((t) => (
            <div
              key={t.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{t.category}</div>
              <pre className="text-[10px] text-blue-300">{t.content}</pre>
            </div>
          ))
        )}
      </div>

      {/* Automations */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          Automations
        </div>

        {data.automations.length === 0 ? (
          <div className="text-xs text-slate-400">No automations yet.</div>
        ) : (
          data.automations.map((a) => (
            <div
              key={a.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">
                {a.type} — {a.frequency}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Logs */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          AI Actions
        </div>

        {data.logs.length === 0 ? (
          <div className="text-xs text-slate-400">No AI actions yet.</div>
        ) : (
          data.logs.map((log) => (
            <div
              key={log.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{log.action}</div>
              <div className="text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Usage */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          AI Usage
        </div>

        {data.usage.length === 0 ? (
          <div className="text-xs text-slate-400">No usage yet.</div>
        ) : (
          data.usage.map((u) => (
            <div
              key={u.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{u.feature}</div>
              <div className="text-blue-300">{u.tokens} tokens</div>
              <div className="text-green-300">${u.cost.toFixed(4)}</div>
            </div>
          ))
        )}
      </div>

      {/* Workspace Digests */}
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-100">
          Workspace Digests
        </div>

        {data.digests.length === 0 ? (
          <div className="text-xs text-slate-400">No digests yet.</div>
        ) : (
          data.digests.map((d) => (
            <div
              key={d.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">
                {new Date(d.createdAt).toLocaleString()}
              </div>
              <pre className="text-[10px] text-blue-300">{d.digest}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
