"use client";

import { useState } from "react";

export default function GrantRequirementsPanel({
  workspaceId,
  documentId,
  userId,
  content
}) {
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState(null);
  const [grantText, setGrantText] = useState("");

  async function extractRequirements() {
    if (!grantText.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/requirements`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            grantText,
            content: JSON.parse(content)
          })
        }
      );

      const data = await res.json();
      setRequirements(data.requirements || null);
    } catch (err) {
      console.error("Requirements extraction failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Requirements Extractor</h2>

      <textarea
        value={grantText}
        onChange={(e) => setGrantText(e.target.value)}
        className="w-full border rounded-md p-2 text-sm h-32"
        placeholder="Paste grant guidelines, RFP text, or NOFO details here..."
      />

      <button
        onClick={extractRequirements}
        className="mt-2 mb-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {loading ? "Extracting…" : "Extract Requirements"}
      </button>

      {!requirements && !loading && (
        <div className="text-gray-500">No requirements extracted yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI analyzing grant text…</div>
      )}

      {requirements && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {requirements.eligibility && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Eligibility</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {requirements.eligibility.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {requirements.requiredSections && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Required Sections</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {requirements.requiredSections.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {requirements.formatting && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Formatting Rules</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {requirements.formatting.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {requirements.attachments && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Required Attachments</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {requirements.attachments.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {requirements.deadlines && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Deadlines</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {requirements.deadlines.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {requirements.criteria && (
            <div className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="text-sm font-medium">Evaluation Criteria</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {requirements.criteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
