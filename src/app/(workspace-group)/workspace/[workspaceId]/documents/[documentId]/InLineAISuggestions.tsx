"use client"

import { useEffect, useState, useRef } from "react";

export default function InlineAISuggestions({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  async function fetchSuggestion() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/inline`,
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
      setSuggestion(data.suggestion || "");
    } catch (err) {
      console.error("Inline AI suggestion failed:", err);
    }

    setLoading(false);
  }

  function acceptSuggestion() {
    if (!suggestion) return;

    try {
      const updated = JSON.parse(content);
      updated.inline = suggestion;

      setContent(JSON.stringify(updated, null, 2));
      setSuggestion("");
    } catch (err) {
      console.error("Failed to accept suggestion:", err);
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Tab" && suggestion) {
        e.preventDefault();
        acceptSuggestion();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [suggestion]);

  return (
    <div className="mt-2">
      {loading ? (
        <div className="text-xs text-gray-400">AI thinking…</div>
      ) : suggestion ? (
        <div className="text-xs text-gray-400 italic">
          {suggestion}
        </div>
      ) : (
        <button
          onClick={fetchSuggestion}
          className="text-xs text-blue-600 underline"
        >
          Generate suggestion
        </button>
      )}
    </div>
  );
}
