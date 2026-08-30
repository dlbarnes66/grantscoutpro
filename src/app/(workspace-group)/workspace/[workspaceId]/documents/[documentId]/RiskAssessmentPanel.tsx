"use client"

import { useState } from "react";

export default function RiskAssessmentPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [riskReport, setRiskReport] = useState(null);

  async function runRiskAssessment() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/risk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            content // ← FIXED: no JSON.parse()
          })
        }
      );

      const data = await res.json();
      setRiskReport(data.risk || null);
    } catch (err) {
      console.error("Risk assessment failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Risk Assessment</h2>

      <button
        onClick={runRiskAssessment}
        className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        {loading ? "Analyzing…" : "Run Risk Assessment"}
      </button>

      {!riskReport && !loading && (
        <div className="text-gray-500">No risk report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI scanning for risks…</div>
      )}

      {riskReport && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Overall Risk */}
          <div className="border rounded-md p-3 bg-red-50">
            <div className="text-sm font-medium">Overall Risk Level</div>
            <div className="text-2xl font-bold text-red-600">
              {riskReport.overallRisk || "Unknown"}
            </div>
          </div>

          {/* Red Flags */}
          {Array.isArray(riskReport.redFlags) &&
            riskReport.redFlags.length > 0 && (
              <div className="border rounded-md p-3 bg-red-50 space-y-2">
                <div className="text-sm font-medium text-red-700">
                  Critical Red Flags
                </div>

                <ul className="text-xs text-red-600 list-disc ml-4">
                  {riskReport.redFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Warnings */}
          {Array.isArray(riskReport.warnings) &&
            riskReport.warnings.length > 0 && (
              <div className="border rounded-md p-3 bg-yellow-50 space-y-2">
                <div className="text-sm font-medium text-yellow-700">
                  Warnings
                </div>

                <ul className="text-xs text-yellow-700 list-disc ml-4">
                  {riskReport.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Recommendations */}
          {Array.isArray(riskReport.recommendations) &&
            riskReport.recommendations.length > 0 && (
              <div className="border rounded-md p-3 bg-green-50 space-y-2">
                <div className="text-sm font-medium text-green-700">
                  Recommendations
                </div>

                <ul className="text-xs text-green-700 list-disc ml-4">
                  {riskReport.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
