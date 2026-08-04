"use client";

import { useEffect, useState, useRef } from "react";

export default function AutocompleteAI({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [streamText, setStreamText] = useState("");
  const [active, setActive] = useState(false);
  const controllerRef = useRef(null);

  async function startAutocomplete() {
    try {
      setStreamText("");
      setActive(true);

      controllerRef.current = new AbortController();

      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/autocomplete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            content: JSON.parse(content)
          }),
          signal: controllerRef.current.signal
        }
      );

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setStreamText((prev) => prev + chunk);
      }
    } catch (err) {
      console.error("Autocomplete stream failed:", err);
    }
  }

  function acceptAutocomplete() {
    if (!streamText) return;

    try {
      const updated = JSON.parse(content);
      updated.autocomplete = streamText;

      setContent(JSON.stringify(updated, null, 2));
      setStreamText("");
      setActive(false);
    } catch (err) {
      console.error("Failed to accept autocomplete:", err);
    }
  }

  function cancelAutocomplete() {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setStreamText("");
    setActive(false);
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Tab" && streamText) {
        e.preventDefault();
        acceptAutocomplete();
      }
      if (e.key === "Escape" && streamText) {
        e.preventDefault();
        cancelAutocomplete();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [streamText]);

  return (
    <div className="mt-2">
      {!active && (
        <button
          onClick={startAutocomplete}
          className="text-xs text-blue-600 underline"
        >
          Start autocomplete
        </button>
      )}

      {active && (
        <div className="text-xs text-gray-400 italic">
          {streamText || "AI is generating…"}
        </div>
      )}
    </div>
  );
}
