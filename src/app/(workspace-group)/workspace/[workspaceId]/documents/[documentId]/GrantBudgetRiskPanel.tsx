"use client"

import { useState } from "react";

export default function GrantBudgetRiskPanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [budgetRisk, setBudgetRisk] = useState(null);

  async function runBudgetRisk() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/budget-risk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      const data = await res.json();
      setBudgetRisk(data.budgetRisk || null);
    } catch (err) {
      console.error("Budget risk failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Budget Risk</h2>

      <button
        onClick={runBudgetRisk}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-md"
      >
        {loading ? "Analyzing…" : "Run Budget Risk"}
      </button>

      {!budgetRisk && !loading && (
        <div className="text-gray-500">No budget risk report yet.</div>
      )}

      {loading && <div className="text-gray-500">AI analyzing budget…</div>}

      {budgetRisk && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border p-3 rounded bg-orange-50">
            <div className="text-sm font-medium">Overall Budget Risk</div>
            <div className="text-2xl font-bold text-orange-700">
              {budgetRisk.overallRisk || "Unknown"}
            </div>
          </div>

          {Array.isArray(budgetRisk.issues) &&
            budgetRisk.issues.length > 0 && (
              <div className="border p-3 rounded bg-red-50">
                <div className="text-sm font-medium text-red-700">
                  Issues Found
                </div>
                <ul className="text-xs text-red-600 list-disc ml-4">
                  {budgetRisk.issues.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
            )}

          {Array.isArray(budgetRisk.recommendations) &&
            budgetRisk.recommendations.length > 0 && (
              <div className="border p-3 rounded bg-green-50">
                <div className="text-sm font-medium text-green-700">
                  Recommendations
                </div>
                <ul className="text-xs text-green-700 list-disc ml-4">
                  {budgetRisk.recommendations.map((r, idx) => (
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
