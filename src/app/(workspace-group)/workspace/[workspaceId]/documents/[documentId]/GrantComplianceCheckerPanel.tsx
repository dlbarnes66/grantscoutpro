"use client";

import { useState } from "react";

export default function GrantComplianceCheckerPanel({
  workspaceId,
  documentId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [compliance, setCompliance] = useState(null);

  async function runCompliance() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/compliance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        }
      );

      const data = await res.json();
      setCompliance(data.compliance || null);
    } catch (err) {
      console.error("Compliance check failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Compliance Checker</h2>

      <button
        onClick={runCompliance}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-md"
      >
        {loading ? "Checking…" : "Run Compliance Check"}
      </button>

      {!compliance && !loading && (
        <div className="text-gray-500">No compliance report yet.</div>
      )}

      {loading && <div className="text-gray-500">AI checking compliance…</div>}

      {compliance && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {Array.isArray(compliance.issues) &&
            compliance.issues.length > 0 && (
              <div className="border p-3 rounded bg-red-50">
                <div className="text-sm font-medium text-red-700">
                  Compliance Issues
                </div>
                <ul className="text-xs text-red-600 list-disc ml-4">
                  {compliance.issues.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
            )}

          {Array.isArray(compliance.recommendations) &&
            compliance.recommendations.length > 0 && (
              <div className="border p-3 rounded bg-green-50">
                <div className="text-sm font-medium text-green-700">
                  Recommendations
                </div>
                <ul className="text-xs text-green-700 list-disc ml-4">
                  {compliance.recommendations.map((r, idx) => (
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
