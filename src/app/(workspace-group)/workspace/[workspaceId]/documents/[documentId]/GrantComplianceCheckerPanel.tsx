"use client";

import { useState } from "react";

export default function GrantComplianceCheckerPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [compliance, setCompliance] = useState(null);

  async function analyzeCompliance() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/compliance`,
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
      setCompliance(data.compliance || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Compliance check failed:", err);
    }

    setLoading(false);
  }

  function getColor(level) {
    if (level === "pass") return "bg-green-200";
    if (level === "warning") return "bg-yellow-200";
    return "bg-red-300"; // fail
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Compliance Checker</h2>

      <button
        onClick={analyzeCompliance}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading ? "Checking…" : "Run Compliance Check"}
      </button>

      {!compliance && !loading && (
        <div className="text-gray-500">No compliance report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI checking compliance…</div>
      )}

      {compliance && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-blue-50">
            <div className="text-sm font-medium">Overall Compliance</div>
            <div className="text-3xl font-bold text-blue-700">
              {compliance.overallScore}%
            </div>
          </div>

          {compliance.sections.map((section, i) => (
            <div
              key={i}
              className={`border rounded-md p-3 ${getColor(section.level)} space-y-2`}
            >
              <div className="text-sm font-medium">
                {section.label}
              </div>

              <div className="text-sm font-semibold capitalize">
                Status: {section.level}
              </div>

              <div className="text-xs text-gray-700">
                {section.text}
              </div>

              {section.issues && (
                <div>
                  <div className="text-xs font-medium text-red-700">
                    Compliance Issues
                  </div>
                  <ul className="text-xs text-red-700 list-disc ml-4">
                    {section.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
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

          {compliance.globalRecommendations && (
            <div className="border rounded-md p-3 bg-green-50 space-y-2">
              <div className="text-sm font-medium text-green-700">
                Global Compliance Fixes
              </div>
              <ul className="text-xs text-green-700 list-disc ml-4">
                {compliance.globalRecommendations.map((r, idx) => (
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
