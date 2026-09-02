"use client"

import { useEffect, useState } from "react";

export default function AIAssistantPanel({ workspaceId, documentId, userId, content, setContent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendAIRequest(type) {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai`,
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
        { role: "assistant", text: data.message || "AI updated the document." }
      ]);
    } catch (err) {
      console.error("AI request failed:", err);
    }

    setLoading(false);
  }

  async function sendChatMessage() {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);

    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            type: "chat",
            message: input,
            content: JSON.parse(content)
          })
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.message || "AI responded." }
      ]);
    } catch (err) {
      console.error("AI chat failed:", err);
    }

    setInput("");
    setLoading(false);
  }

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">AI Assistant</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => sendAIRequest("rewrite")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Rewrite
        </button>

        <button
          onClick={() => sendAIRequest("summarize")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Summarize
        </button>

        <button
          onClick={() => sendAIRequest("expand")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Expand
        </button>

        <button
          onClick={() => sendAIRequest("shorten")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Shorten
        </button>

        <button
          onClick={() => sendAIRequest("tone")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Fix Tone
        </button>

        <button
          onClick={() => sendAIRequest("clarity")}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Improve Clarity
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-md ${
              m.role === "assistant"
                ? "bg-gray-100 border"
                : "bg-blue-100 border"
            }`}
          >
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full border rounded-md p-2 text-sm"
        placeholder="Ask the AI something..."
      />

      <button
        onClick={sendChatMessage}
        className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}
