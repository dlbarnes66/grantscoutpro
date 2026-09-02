"use client"

import { useState } from "react";

export default function GrantScorePredictorPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  async function runPrediction() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/predict`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            content: JSON.parse(content)
          })
        }
      );

      const data = await res.json();
      setPrediction(data.prediction || null);
    } catch (err) {
      console.error("Grant score prediction failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Score Predictor</h2>

      <button
        onClick={runPrediction}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        {loading ? "Calculating…" : "Predict Score"}
      </button>

      {!prediction && !loading && (
        <div className="text-gray-500">No prediction yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating competitiveness…</div>
      )}

      {prediction && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-purple-50">
            <div className="text-sm font-medium">Win Probability</div>
            <div className="text-3xl font-bold text-purple-700">
              {prediction.winProbability}%
            </div>
          </div>

          <div className="border rounded-md p-3 bg-purple-50">
            <div className="text-sm font-medium">Confidence Level</div>
            <div className="text-xl font-bold text-purple-700">
              {prediction.confidence}%
            </div>
          </div>

          {prediction.factors && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Key Factors</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {prediction.factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {prediction.improvements && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Improvements to Increase Score
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {prediction.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
