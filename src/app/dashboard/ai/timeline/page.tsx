import { prisma } from "@/lib/prisma";
import { generateTimelineAnalysis } from "./actions";

type TimelinePageProps = {
  searchParams?: {
    grantId?: string;
    workspaceId?: string;
    userId?: string;
  };
};

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const grantId = searchParams?.grantId ?? "";
  const workspaceId = searchParams?.workspaceId ?? "";
  const userId = searchParams?.userId ?? "";

  let latestAnalysis: Awaited<
    ReturnType<typeof generateTimelineAnalysis>
  > | null = null;

  if (grantId && workspaceId && userId) {
    latestAnalysis = await generateTimelineAnalysis({
      grantId,
      workspaceId,
      userId
    });
  }

  const history = await prisma.grantEvidenceHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      workspace: true,
      grant: true,
      user: true
    }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        AI Timeline Dashboard
      </h1>

      {latestAnalysis && (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Latest Timeline Analysis
          </h2>
          <pre className="text-xs whitespace-pre-wrap text-slate-300">
            {latestAnalysis.timelineText}
          </pre>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
            <div>Fit: {latestAnalysis.scores.fitScore ?? "N/A"}</div>
            <div>
              Readiness: {latestAnalysis.scores.readinessScore ?? "N/A"}
            </div>
            <div>
              Competitiveness:{" "}
              {latestAnalysis.scores.competitivenessScore ?? "N/A"}
            </div>
            <div>
              Alignment: {latestAnalysis.scores.alignmentScore ?? "N/A"}
            </div>
            <div>Risk: {latestAnalysis.scores.riskScore ?? "N/A"}</div>
            <div>
              Overall:{" "}
              {latestAnalysis.scores.overallScore !== null
                ? latestAnalysis.scores.overallScore.toFixed(2)
                : "N/A"}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-slate-100 mb-3">
          Timeline History (Grant Evidence)
        </h2>
        <div className="space-y-2 text-sm text-slate-200">
          {history.length === 0 && (
            <div className="text-slate-400">
              No timeline history recorded yet.
            </div>
          )}
          {history.map((h) => (
            <div
              key={h.id}
              className="border border-slate-800 rounded-md p-3 space-y-1"
            >
              <div className="flex justify-between text-xs text-slate-400">
                <span>
                  {h.workspace?.name ?? "Unknown workspace"} ·{" "}
                  {h.grant?.title ?? "Unknown grant"}
                </span>
                <span>
                  {h.user?.name ?? "Unknown user"} ·{" "}
                  {h.createdAt.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-slate-300 whitespace-pre-wrap">
                {h.analysis}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 mt-2">
                <div>Overall: {h.overall}</div>
                <div>Strength: {h.evidenceStrength}</div>
                <div>Relevance: {h.evidenceRelevance}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
