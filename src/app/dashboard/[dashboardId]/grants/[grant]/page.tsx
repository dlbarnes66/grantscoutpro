import React from "react";
import { prisma } from "@/lib/prisma.ts";
import { getServerSession } from "next-auth";
import { loadGrantIntelligence } from "../../../grants/_lib/loadGrantIntelligence";

export default async function GrantIntelligencePage({
  params,
}: {
  params: { grantId: string };
}) {
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

  const data = await loadGrantIntelligence(params.grant, workspace.id);

  if (!data.grant) {
    return <div className="text-slate-300 text-sm">Grant not found.</div>;
  }

  const grant = data.grant;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-2xl font-semibold text-slate-100">
          {grant.title}
        </div>
        <div className="text-sm text-slate-400">
          Unified AI intelligence for this grant.
        </div>
      </div>

      {/* AI Scores */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-slate-400">Eligibility</div>
          <div className="text-lg font-semibold text-slate-100">
            {grant.aiEligibilityScore ?? "N/A"}
          </div>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-slate-400">Risk</div>
          <div className="text-lg font-semibold text-slate-100">
            {grant.aiRiskScore ?? "N/A"}
          </div>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-slate-400">Competitiveness</div>
          <div className="text-lg font-semibold text-slate-100">
            {grant.aiCompetitivenessScore ?? "N/A"}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="text-sm font-semibold text-slate-100 mb-2">
          AI Summary
        </div>
        <pre className="text-xs text-blue-300">
          {grant.aiSummary ?? "No summary yet."}
        </pre>
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="text-sm font-semibold text-slate-100 mb-2">
          AI Recommendations
        </div>
        <pre className="text-xs text-green-300">
          {grant.aiRecommendations ?? "No recommendations yet."}
        </pre>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-100">
          Outline Sections
        </div>

        {data.sections.length === 0 ? (
          <div className="text-xs text-slate-400">No sections generated.</div>
        ) : (
          data.sections.map((s) => (
            <div
              key={s.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div className="text-slate-200 font-medium">{s.title}</div>
              <div className="text-slate-400">{s.content}</div>
            </div>
          ))
        )}
      </div>

      {/* Narratives */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-100">
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
              <pre className="text-[10px] text-blue-300">{n.content}</pre>
            </div>
          ))
        )}
      </div>

      {/* Rewrites */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-100">
          Rewrites
        </div>

        {data.rewrites.length === 0 ? (
          <div className="text-xs text-slate-400">No rewrites yet.</div>
        ) : (
          data.rewrites.map((r) => (
            <div
              key={r.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <pre className="text-[10px] text-slate-500">{r.original}</pre>
              <pre className="text-[10px] text-blue-300">{r.rewritten}</pre>
            </div>
          ))
        )}
      </div>

      {/* Proposals */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-100">
          Proposals
        </div>

        {data.applications.length === 0 ? (
          <div className="text-xs text-slate-400">No proposals yet.</div>
        ) : (
          data.applications.map((app) => (
            <div
              key={app.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              {app.versions.map((v) => (
                <div key={v.id} className="mt-2">
                  <pre className="text-[10px] text-blue-300">{v.content}</pre>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* AI Logs */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-100">
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
    </div>
  );
}
