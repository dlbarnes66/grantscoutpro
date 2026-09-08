"use client"

import { useState } from "react";

export default function StrengthWeaknessRatioPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [ratio, setRatio] = useState(null);

  async function generateRatio() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/ratio`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            content: JSON.parse(content)
          })
        }
      );

      if (!res.ok) {

        throw new Error(`Request failed (${res.status})`);

      }

      const data = await res.json();
      setRatio(data.ratio || null);
    } catch (err) {
      console.error("Ratio analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 80) return "bg-green-200";
    if (score >= 60) return "bg-blue-200";
    if (score >= 40) return "bg-yellow-200";
    return "bg-red-200";
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">
        Strength‑to‑Weakness Ratio Analyzer
      </h2>

      <button
        onClick={generateRatio}
        className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
      >
        {loading ? "Analyzing…" : "Generate Ratio"}
      </button>

      {!ratio && !loading && (
        <div className="text-gray-500">No ratio analysis yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI calculating ratios…</div>
      )}

      {ratio && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-teal-50">
            <div className="text-sm font-medium">Overall Ratio</div>
            <div className="text-3xl font-bold text-teal-700">
              {ratio.overallRatio}
            </div>
            <div className="text-xs text-gray-700">
              (Strengths ÷ Weaknesses)
            </div>
          </div>

          {ratio.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Ratio Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                Strengths: {section.strengths.length}  
                Weaknesses: {section.weaknesses.length}
              </div>

              {section.strengths.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Strengths
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {section.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.weaknesses.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.notes && (
                <div className="text-xs text-gray-600 italic">
                  {section.notes}
                </div>
              )}
            </div>
          ))}

          {ratio.recommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Recommendations to Improve Ratio
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {ratio.recommendations.map((r, idx) => (
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
