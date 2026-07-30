"use client";

import { useState } from "react";

export default function GrantEvidenceStrengthPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState(null);

  async function analyzeEvidence() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/evidence`,
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
      setEvidence(data.evidence || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Evidence strength analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // strong evidence
    if (score >= 65) return "bg-blue-200";      // good evidence
    if (score >= 45) return "bg-yellow-200";    // weak evidence
    return "bg-red-300";                        // unsupported
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Evidence Strength Analyzer</h2>

      <button
        onClick={analyzeEvidence}
        className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        {loading ? "Analyzing…" : "Analyze Evidence Strength"}
      </button>

      {!evidence && !loading && (
        <div className="text-gray-500">No evidence report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating evidence strength…</div>
      )}

      {evidence && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-emerald-50">
            <div className="text-sm font-medium">Overall Evidence Strength</div>
            <div className="text-3xl font-bold text-emerald-700">
              {evidence.overallScore}%
            </div>
          </div>

          {evidence.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold">
                Evidence Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Evidence Strengths
                  </div>
                  <ul className="text-xs text-green-700 list-disc ml-4">
                    {section.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.weaknesses && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Evidence Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.gaps && (
                <div>
                  <div className="text-xs font-medium text-orange-700">
                    Evidence Gaps
                  </div>
                  <ul className="text-xs text-orange-700 list-disc ml-4">
                    {section.gaps.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.recommendations && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Recommendations
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {evidence.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Evidence Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {evidence.globalRecommendations.map((r, idx) => (
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
