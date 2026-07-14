"use client";

import { useState } from "react";

export default function GrantRewriterPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  async function rewrite(type) {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/rewrite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            type,
            content: JSON.parse(content)
          })
        }
      );

      const data = await res.json();

      if (data.output) {
        setContent(JSON.stringify(data.output, null, 2));
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.message || "Document rewritten." }
      ]);
    } catch (err) {
      console.error("Grant rewrite failed:", err);
    }

    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Grant Rewriter</h2>

      <div className="grid grid-cols-1 gap-2 mb-4">
        <button
          onClick={() => rewrite("professional")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Professional Rewrite
        </button>

        <button
          onClick={() => rewrite("funder")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Funder‑Aligned Rewrite
        </button>

        <button
          onClick={() => rewrite("concise")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Concise Rewrite
        </button>

        <button
          onClick={() => rewrite("expanded")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Expanded Rewrite
        </button>

        <button
          onClick={() => rewrite("narrative")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Narrative Rewrite
        </button>

        <button
          onClick={() => rewrite("technical")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Technical Rewrite
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className="p-3 bg-gray-100 border rounded-md text-sm"
          >
            {m.text}
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-xs text-gray-400 mt-2">AI rewriting…</div>
      )}
    </div>
  );
}
