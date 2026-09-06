"use client";

import { useState } from "react";

export default function GrantRiskAssessmentPanel({
  workspaceId,
  documentId,
  userId,
  content,
}: {
  workspaceId: string;
  documentId: string;
  userId: string;
  content: string;
}) {
  const [loading, setLoading] = useState(false);
  const [riskReport, setRiskReport] = useState<any>(null);

  async function runRiskAssessment() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/risk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            content,
          }),
        }
      );

      const text = await res.text();

      console.log("RISK STATUS", res.status);
      console.log("RISK RESPONSE", text);

      const data = text ? JSON.parse(text) : {};

      setRiskReport(data.risk || null);
    } catch (err) {
      console.error("Risk assessment failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-red-500">
            AI Risk Assessment
          </h2>

          <p className="mt-3 text-slate-400">
            Analyze proposal weaknesses, eligibility issues,
            compliance gaps, and budget risks before submission.
          </p>
        </div>

        {!riskReport && !loading && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-10">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-semibold text-cyan-400">
                  Eligibility Review
                </h3>

                <p className="text-slate-400">
                  Validate grant alignment, eligibility requirements,
                  and qualification criteria.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-semibold text-cyan-400">
                  Budget Analysis
                </h3>

                <p className="text-slate-400">
                  Identify funding gaps, unrealistic assumptions,
                  and financial concerns.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-semibold text-cyan-400">
                  Compliance Check
                </h3>

                <p className="text-slate-400">
                  Review submission requirements, deadlines,
                  restrictions, and funder guidelines.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <h3 className="mb-3 text-lg font-semibold text-cyan-400">
                  Risk Detection
                </h3>

                <p className="text-slate-400">
                  Surface weaknesses and proposal risks before review.
                </p>
              </div>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
              <h3 className="mb-2 text-xl font-semibold">
                Ready to Analyze
              </h3>

              <p className="mb-6 text-slate-400">
                Run a comprehensive AI assessment to identify risks,
                missing information, and proposal weaknesses.
              </p>

              <button
                onClick={runRiskAssessment}
                className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition-all hover:bg-cyan-400"
              >
                Run Risk Assessment
              </button>
            </div>
          </>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
            <h3 className="mb-3 text-xl font-semibold">
              AI Analysis In Progress
            </h3>

            <p className="text-slate-400">
              Analyzing proposal risks, compliance issues,
              and funding concerns...
            </p>
          </div>
        )}

        {riskReport && (
          <div className="space-y-6">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
              <h3 className="mb-3 text-xl font-semibold">
                Overall Risk Level
              </h3>

              <p className="text-4xl font-bold text-red-400">
                {riskReport.overallRisk || "Unknown"}
              </p>
            </div>

            {Array.isArray(riskReport.redFlags) &&
              riskReport.redFlags.length > 0 && (
                <div className="rounded-2xl border border-red-800 bg-red-950/30 p-8">
                  <h3 className="mb-4 text-xl font-semibold text-red-400">
                    Critical Red Flags
                  </h3>

                  <ul className="space-y-2">
                    {riskReport.redFlags.map(
                      (flag: string, index: number) => (
                        <li key={index}>
                          • {flag}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}