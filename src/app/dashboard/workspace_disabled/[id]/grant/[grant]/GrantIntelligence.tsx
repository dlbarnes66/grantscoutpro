"use client";

import { useState } from "react";

export default function GrantIntelligence({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  async function analyzeGrant() {
    setLoading(true);

    const res = await fetch("/api/grant/intelligence", {
      method: "POST",
      body: JSON.stringify({ workspaceId, grantId }),
    });

    const data = await res.json();
    setReport(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Grant Intelligence Report</h1>

      <button
        onClick={analyzeGrant}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Analyzing..." : "Run Grant Intelligence"}
      </button>

      {report && (
        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold">Eligibility</h2>
          <p>{report.eligibility}</p>

          <h2 className="text-xl font-semibold">Fit Score</h2>
          <p className="text-3xl font-bold">{report.fitScore}/100</p>

          <h2 className="text-xl font-semibold">Risks</h2>
          <ul className="list-disc ml-6">
            {report.risks.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold">Alignment</h2>
          <ul className="list-disc ml-6">
            {report.alignment.map((a: string, i: number) => (
              <li key={i}>{a}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold">Recommendations</h2>
          <ul className="list-disc ml-6">
            {report.recommendations.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold">Missing Information</h2>
          <ul className="list-disc ml-6">
            {report.missingInfo.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
