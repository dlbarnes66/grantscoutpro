"use client"

import { useState } from "react";

export default function GrantTimelinePanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);

  async function generateTimeline() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/timeline`,
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
      setTimeline(data.timeline || null);

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }
    } catch (err) {
      console.error("Timeline generation failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Grant Timeline Generator</h2>

      <button
        onClick={generateTimeline}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        {loading ? "Generating…" : "Generate Timeline"}
      </button>

      {!timeline && !loading && (
        <div className="text-gray-500">No timeline generated yet.</div>
      )}

      {loading && (
        <div className="text-gray-500">AI building your timeline…</div>
      )}

      {timeline && (
        <div className="space-y-4 overflow-y-auto flex-1">
          {timeline.map((item, i) => (
            <div
              key={i}
              className="border rounded-md p-3 bg-gray-50 space-y-2"
            >
              <div className="text-sm font-medium text-indigo-700">
                {item.phase}
              </div>

              <div className="text-xs text-gray-600">
                {item.description}
              </div>

              <div className="text-xs text-gray-700">
                <span className="font-semibold">Start:</span> {item.start}
              </div>

              <div className="text-xs text-gray-700">
                <span className="font-semibold">End:</span> {item.end}
              </div>

              {item.tasks && item.tasks.length > 0 && (
                <ul className="text-xs text-gray-700 list-disc ml-4">
                  {item.tasks.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
