"use client"

import { useState } from "react";

export default function ComplianceCheckerPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  async function runComplianceCheck() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/compliance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
  userId,
  text: content
})
        }
      );

      if (!res.ok) {

        throw new Error(`Request failed (${res.status})`);

      }

      const data = await res.json();
      setReport(data.compliance || null);
    } catch (err) {
      console.error("Compliance check failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Compliance Checker</h2>

      <button
        onClick={runComplianceCheck}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading ? "Checking…" : "Run Compliance Check"}
      </button>

      {!report && !loading && (
        <div className="text-gray-500">No compliance report yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI reviewing requirements…</div>
      )}

      {report && (
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="text-sm font-medium">Overall Compliance</div>
            <div className="text-2xl font-bold text-blue-600">
              {report.overallScore}%
            </div>
          </div>

          {report.issues &&
            report.issues.map((issue, i) => (
              <div
                key={i}
                className="border rounded-md p-3 bg-gray-50 space-y-2"
              >
                <div className="text-sm font-medium text-red-600">
                  {issue.type}
                </div>

                <div className="text-xs text-gray-600">
                  {issue.description}
                </div>

                {issue.recommendation && (
                  <div className="text-xs text-blue-600">
                    Recommendation: {issue.recommendation}
                  </div>
                )}
              </div>
            ))}

          {report.missingSections &&
            report.missingSections.length > 0 && (
              <div className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="text-sm font-medium text-red-600">
                  Missing Required Sections
                </div>

                <ul className="text-xs text-gray-600 list-disc ml-4">
                  {report.missingSections.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

          {report.alignment && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Funder Alignment</div>

              <div className="text-xs text-gray-600">
                {report.alignment.summary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
