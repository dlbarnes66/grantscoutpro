"use client";

import { useState } from "react";

export default function GrantReviewerSimulationPanel() {
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);

  async function runSimulation() {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/reviewer-sim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Grant content goes here" })
      });

      const data = await res.json();
      setSimulation(data.simulation || null);
    } catch (err) {
      console.error("Reviewer simulation failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";
    if (score >= 65) return "bg-blue-200";
    if (score >= 45) return "bg-yellow-200";
    return "bg-red-300";
  }

  return (
    <div className="w-full border rounded-lg bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Reviewer Simulation</h2>

      <button
        onClick={runSimulation}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-black"
      >
        {loading ? "Simulating…" : "Run Reviewer Simulation"}
      </button>

      {!simulation && !loading && (
        <div className="text-gray-500">No reviewer simulation yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI simulating reviewer behavior…</div>
      )}

      {simulation && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-100">
            <div className="text-sm font-medium">Overall Funding Likelihood</div>
            <div className="text-3xl font-bold text-gray-800">
              {simulation.overallLikelihood}%
            </div>
          </div>

          {simulation.reviewers.map((rev, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(rev.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{rev.type} Reviewer</div>
              <div className="text-sm font-semibold">Score: {rev.score}%</div>
              <div className="text-xs text-gray-700">{rev.summary}</div>

              {rev.concerns && (
                <div>
                  <div className="text-xs font-medium text-red-700">Concerns</div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {rev.concerns.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rev.praise && (
                <div>
                  <div className="text-xs font-medium text-green-700">Praise</div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {rev.praise.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rev.recommendations && (
                <div>
                  <div className="text-xs font-medium text-blue-700">Recommendations</div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {rev.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {simulation.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Reviewer Insights
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {simulation.globalRecommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
