// src/hooks/useRagChat.ts
"use client";

import { useCallback, useState } from "react";

export interface ChatSource {
  id: string;
  title: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

const MAX_HISTORY_SENT = 8;

export function useRagChat(workspaceId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      const text = message.trim();
      if (!workspaceId || !text) return;

      const userMessage: ChatMessage = { role: "user", content: text };
      const historyForRequest = [...messages, userMessage].slice(-MAX_HISTORY_SENT);

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/ai/rag`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: text,
            history: historyForRequest.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errorText = data?.error || "Sorry, something went wrong answering that.";
          setError(errorText);
          setMessages((prev) => [...prev, { role: "assistant", content: errorText }]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer, sources: data.sources || [] },
        ]);
      } catch (err) {
        console.error("RAG chat error:", err);
        const errorText = "Sorry, something went wrong answering that.";
        setError(errorText);
        setMessages((prev) => [...prev, { role: "assistant", content: errorText }]);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, messages]
  );

  return { messages, loading, error, sendMessage };
}
