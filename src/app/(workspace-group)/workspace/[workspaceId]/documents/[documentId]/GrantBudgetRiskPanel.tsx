"use client";

import { useState } from "react";

export default function GrantBudgetRiskPanel({
  workspaceId,
  documentId,
  content,
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: content,
          }),
        }
      );

      const data = await res.json();

      console.log("BUDGET RISK RESPONSE", data);

      setBudgetRisk(data.budgetRisk || null);
    } catch (err) {
      console.error("Budget risk failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">
        AI Budget Risk
      </h2>

      <button
        onClick={runBudgetRisk}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-md"
      >
        {loading ? "Analyzing..." : "Run Budget Risk"}
      </button>

      {!budgetRisk && !loading && (
        <div className="text-gray-500">
          No budget risk report yet.
        </div>
      )}

      {loading && (
        <div className="text-gray-500">
          AI analyzing budget...
        </div>
      )}

      {budgetRisk && (
        <pre className="flex-1 overflow-auto text-xs bg-gray-100 p-3 rounded">
          {typeof budgetRisk === "string"
            ? budgetRisk
            : JSON.stringify(budgetRisk, null, 2)}
        </pre>
      )}
    </div>
  );
}