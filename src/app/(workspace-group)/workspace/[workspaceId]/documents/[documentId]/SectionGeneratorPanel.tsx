"use client";

import { useState } from "react";

export default function SectionGeneratorPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent
}) {
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [messages, setMessages] = useState([]);

  async function generate(type) {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/sections`,
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
        { role: "assistant", text: data.message || "Section generated." }
      ]);
    } catch (err) {
      console.error("Section generation failed:", err);
    }

    setLoading(false);
  }

  async function generateCustom() {
    if (!customPrompt.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/ai/sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            type: "custom",
            prompt: customPrompt,
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
        { role: "assistant", text: data.message || "Custom section generated." }
      ]);
    } catch (err) {
      console.error("Custom section generation failed:", err);
    }

    setLoading(false);
    setCustomPrompt("");
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Section Generator</h2>

      <div className="grid grid-cols-1 gap-2 mb-4">
        <button
          onClick={() => generate("outline")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Generate Outline
        </button>

        <button
          onClick={() => generate("needs")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Needs Statement
        </button>

        <button
          onClick={() => generate("goals")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Goals & Objectives
        </button>

        <button
          onClick={() => generate("methodology")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Methodology
        </button>

        <button
          onClick={() => generate("evaluation")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Evaluation Plan
        </button>

        <button
          onClick={() => generate("budget")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Budget Narrative
        </button>

        <button
          onClick={() => generate("sustainability")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sustainability Plan
        </button>
      </div>

      <div className="mb-4">
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Describe a custom section to generate..."
        />

        <button
          onClick={generateCustom}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Generate Custom Section
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
        <div className="text-xs text-gray-400 mt-2">AI generating…</div>
      )}
    </div>
  );
}
