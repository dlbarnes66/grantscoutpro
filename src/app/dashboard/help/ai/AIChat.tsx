"use client";

import { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function send() {
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const res = await fetch("/api/help-ai", {
      method: "POST",
      body: JSON.stringify({ question: input })
    });

    const data = await res.json();
    const aiMessage = { role: "assistant", content: data.answer };

    setMessages((prev) => [...prev, aiMessage]);
    setInput("");
  }

  return (
    <div className="border rounded p-4 space-y-4">
      <div className="h-96 overflow-y-auto border rounded p-3 bg-gray-50">
        {messages.map((m, idx) => (
          <div key={idx} className="mb-3">
            <strong>{m.role === "user" ? "You" : "AI"}:</strong>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={send}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
