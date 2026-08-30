"use client";

import { useEffect, useState } from "react";

type Props = {
  workspaceId: string;
  userId: string;
};

type Message = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

export default function CollaborationChat({ workspaceId, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    let active = true;

    async function loadConversation() {
      try {
        const res = await fetch(`/api/messages/conversation?workspaceId=${workspaceId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setMessages(data.messages ?? []);
      } catch (e) {
        console.error("Conversation load failed", e);
      }
    }

    loadConversation();
    const interval = setInterval(loadConversation, 5_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [workspaceId]);

  async function sendMessage() {
    const content = input.trim();
    if (!content) return;

    setInput("");

    try {
      const res = await fetch(`/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, userId, content })
      });

      if (!res.ok) return;

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (e) {
      console.error("Send message failed", e);
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 flex flex-col gap-2 h-64">
      <h2 className="text-sm font-semibold text-slate-200">Collaboration chat</h2>

      <div className="flex-1 overflow-y-auto space-y-1 text-xs">
        {messages.length === 0 ? (
          <p className="text-slate-500">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex flex-col">
              <span className="text-slate-400">
                {m.userId} · {new Date(m.createdAt).toLocaleTimeString()}
              </span>
              <span className="text-slate-100">{m.content}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
