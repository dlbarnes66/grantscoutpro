"use client"

import { useState } from "react";

export default function GrantBudgetBuilderPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(null);
  const [customItems, setCustomItems] = useState("");

  async function generateBudget() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/budget`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            content: JSON.parse(content),
            customItems
          })
        }
      );

      const data = await res.json();
      setBudget(data.budget || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Budget generation failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Budget Builder</h2>

      <textarea
        value={customItems}
        onChange={(e) => setCustomItems(e.target.value)}
        className="w-full border rounded-md p-2 text-sm h-24"
        placeholder="Optional: Add custom budget items (e.g., '3 laptops', 'consultant 20 hrs', etc.)"
      />

      <button
        onClick={generateBudget}
        className="mt-2 mb-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
      >
        {loading ? "Building…" : "Generate Budget"}
      </button>

      {!budget && !loading && (
        <div className="text-gray-500">No budget generated yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI building your budget…</div>
      )}

      {budget && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-green-50">
            <div className="text-sm font-medium">Total Budget</div>
            <div className="text-2xl font-bold text-green-700">
              ${budget.total.toLocaleString()}
            </div>
          </div>

          {budget.categories &&
            budget.categories.map((cat, i) => (
              <div
                key={i}
                className="border rounded-md p-3 bg-gray-50 space-y-2"
              >
                <div className="text-sm font-medium text-green-700">
                  {cat.name}
                </div>

                <div className="text-sm font-semibold">
                  ${cat.total.toLocaleString()}
                </div>

                <ul className="text-xs text-gray-700 list-disc ml-4">
                  {cat.items.map((item, idx) => (
                    <li key={idx}>
                      {item.label}: ${item.amount.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {budget.narrative && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Budget Narrative</div>
              <div className="text-xs text-gray-700">{budget.narrative}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
