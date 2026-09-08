"use client"

import { useEffect, useState } from "react";

export default function MessagesPanel({ workspaceId, documentId, userId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchMessages() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/messages`
      );
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!text.trim()) return;

    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: text
          })
        }
      );

      setText("");
      fetchMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Messages</h2>

      {loading ? (
        <div className="text-gray-500">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-gray-500">No messages yet.</div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className="border rounded-md p-3 bg-gray-50 space-y-1"
            >
              <div className="text-sm font-medium">User {m.userId}</div>
              <div className="text-sm">{m.message}</div>
              <div className="text-xs text-gray-500">
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Send a message..."
        />

        <button
          onClick={sendMessage}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
