"use client"

import { useState } from "react";

export default function GrantReviewerBiasPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [bias, setBias] = useState(null);

  async function analyzeBias() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/bias`,
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
      setBias(data.bias || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Bias detection failed:", err);
    }

    setLoading(false);
  }

  function getColor(level) {
    if (level === "high") return "bg-red-300";
    if (level === "medium") return "bg-orange-300";
    if (level === "low") return "bg-yellow-200";
    return "bg-gray-200"; // minimal bias exposure
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Reviewer Bias Detector</h2>

      <button
        onClick={analyzeBias}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        {loading ? "Analyzing…" : "Detect Reviewer Bias"}
      </button>

      {!bias && !loading && (
        <div className="text-gray-500">No bias report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI scanning for reviewer bias…</div>
      )}

      {bias && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-red-50">
            <div className="text-sm font-medium">Overall Bias Exposure</div>
            <div className="text-3xl font-bold text-red-700">
              {bias.overallExposure}%
            </div>
          </div>

          {bias.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.level)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold capitalize">
                Bias Level: {section.level}
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.biasTypes && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Bias Types Triggered
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.biasTypes.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.triggers && (
                <div>
                  <div className="text-xs font-medium text-orange-700">
                    Triggering Language
                  </div>
                  <ul className="text-xs text-orange-700 list-disc ml-4">
                    {section.triggers.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.recommendations && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Recommendations
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {section.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {bias.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Bias Reduction Strategies
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {bias.globalRecommendations.map((r, idx) => (
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
