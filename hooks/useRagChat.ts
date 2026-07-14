import { useState } from "react";
import { ragChat } from "@/lib/ai/rag-chat";

export function useRagChat(workspaceId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(content: string) {
    setLoading(true);

    const userMessage = { role: "user", content };
    const history = [...messages, userMessage];

    const response = await ragChat({
      workspaceId,
      message: content,
      history,
    });

    const aiMessage = { role: "assistant", content: response };

    setMessages([...history, aiMessage]);
    setLoading(false);
  }

  return {
    messages,
    loading,
    sendMessage,
  };
}
