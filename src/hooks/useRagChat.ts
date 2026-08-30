// src/hooks/useRagChat.ts
"use client";

import { useState } from "react";

export function useRagChat(workspaceId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(message: string) {
    setLoading(true);

    // TODO: replace with real API call
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    setLoading(false);
  }

  return {
    messages,
    loading,
    sendMessage,
  };
}
