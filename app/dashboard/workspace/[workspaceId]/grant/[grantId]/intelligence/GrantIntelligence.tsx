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

  async function generate() {
    setLoading(true);

    const res = await fetch("/api/grants/intelligence", {
      method: "POST",
      body: JSON.stringify({ grantId }),
    });

    const data = await res.json();
    setReport(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <button
        onClick={generate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Analyzing..." : "Generate Intelligence Report"}
      </button>

      {report && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Fit Summary</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {report.summary}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Fit Score</h2>
            <p className="text-lg font-bold text-green-600">
              {report.fitScore}/100
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Strengths</h2>
            <ul className="list-disc ml-6">
              {report.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Weaknesses</h2>
            <ul className="list-disc ml-6">
              {report.weaknesses.map((w: string, i: number) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Risks</h2>
            <ul className="list-disc ml-6">
              {report.risks.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Recommendations</h2>
            <ul className="list-disc ml-6">
              {report.recommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
