"use client";

import { useState, useEffect } from "react";

export default function PortfolioIntelligence({
  workspaceId
}: {
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/workspace/${workspaceId}/portfolio`);
      const json = await res.json();
      setReport(json);
      setLoading(false);
    }
    load();
  }, [workspaceId]);

  if (loading) {
    return <p>Loading portfolio intelligence...</p>;
  }

  return (
    <div className="space-y-8 p-4 border rounded-md bg-white shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">Portfolio Summary</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {report.summary}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Portfolio Score</h2>
        <p className="text-lg font-bold text-blue-600">
          {report.portfolioScore}/100
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Funding Probability</h2>
        <p className="text-lg font-bold text-green-600">
          {report.fundingProbability}%
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Portfolio Strengths</h2>
        <ul className="list-disc ml-6">
          {report.portfolioStrengths.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Portfolio Risks</h2>
        <ul className="list-disc ml-6">
          {report.portfolioRisks.map((r: string, i: number) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Grant Contributions</h2>
        <ul className="space-y-4">
          {report.grantContributions.map((gc: any, i: number) => (
            <li key={i} className="p-3 border rounded-md bg-gray-50">
              <p className="font-semibold">
                Grant ID: {gc.grantId}
              </p>
              <p>Contribution Score: {gc.score}/100</p>
              <p className="text-gray-700">{gc.impact}</p>
            </li>
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
  );
}
