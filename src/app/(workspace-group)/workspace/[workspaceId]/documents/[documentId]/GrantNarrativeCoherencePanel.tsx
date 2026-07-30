"use client";

import { useState } from "react";

export default function GrantNarrativeCoherencePanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [coherence, setCoherence] = useState(null);

  async function analyzeCoherence() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/coherence`,
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
      setCoherence(data.coherence || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Coherence analysis failed:", err);
    }

    setLoading(false);
  }

  function getColor(score) {
    if (score >= 85) return "bg-green-200";     // highly coherent
    if (score >= 65) return "bg-blue-200";      // coherent
    if (score >= 45) return "bg-yellow-200";    // partially coherent
    return "bg-red-300";                        // incoherent
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Narrative Coherence Analyzer</h2>

      <button
        onClick={analyzeCoherence}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        {loading ? "Analyzing…" : "Analyze Narrative Coherence"}
      </button>

      {!coherence && !loading && (
        <div className="text-gray-500">No coherence report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI evaluating narrative coherence…</div>
      )}

      {coherence && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-purple-50">
            <div className="text-sm font-medium">Overall Coherence Score</div>
            <div className="text-3xl font-bold text-purple-700">
              {coherence.overallScore}%
            </div>
          </div>

          {coherence.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.score)} space-y-2`}
            >
              <div className="text-sm font-medium">{section.label}</div>

              <div className="text-sm font-semibold">
                Coherence Score: {section.score}%
              </div>

              <div className="text-xs text-gray-700">{section.text}</div>

              {section.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-700">
                    Coherence Strengths
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
                    Coherence Weaknesses
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.contradictions && (
                <div>
                  <div className="text-xs font-medium text-orange-700">
                    Contradictions
                  </div>
                  <ul className="text-xs text-orange-700 list-disc ml-4">
                    {section.contradictions.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {section.redundancies && (
                <div>
                  <div className="text-xs font-medium text-blue-700">
                    Redundancies
                  </div>
                  <ul className="text-xs text-blue-700 list-disc ml-4">
                    {section.redundancies.map((r, idx) => (
                      <li key={idx}>{r}</li>
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

          {coherence.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Coherence Improvements
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {coherence.globalRecommendations.map((r, idx) => (
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
