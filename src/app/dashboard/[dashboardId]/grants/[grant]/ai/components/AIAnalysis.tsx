"use client";

export function AIAnalysis({ analysis, grantId }: { analysis: any; grantId: string }) {
  if (!analysis) {
    return <div className="text-slate-400">No AI analysis available.</div>;
  }

  return (
    <div className="space-y-10">

      {/* SCORES */}
      <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Scores</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-slate-300">
          <Score label="Eligibility" value={analysis.aiEligibilityScore} />
          <Score label="Alignment" value={analysis.aiAlignmentScore} />
          <Score label="Competitiveness" value={analysis.aiCompetitivenessScore} />
          <Score label="Risk" value={analysis.aiRiskScore} />
          <Score label="Readiness" value={analysis.aiReadinessScore} />
        </div>
      </section>

      {/* SUMMARY */}
      {analysis.aiSummary && (
        <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">AI Summary</h2>
          <p className="text-slate-300 whitespace-pre-line">{analysis.aiSummary}</p>
        </section>
      )}

      {/* RECOMMENDATIONS */}
      {analysis.aiRecommendations && (
        <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Recommendations</h2>

          <ul className="list-disc ml-6 text-slate-300">
            {analysis.aiRecommendations.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-slate-100 font-semibold">{value ?? "—"}</div>
    </div>
  );
}
