import { useState } from "react";

export function useRagChat(workspaceId: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/workspaces/${workspaceId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message, history }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Chat failed");

      setHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: json.response },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { history, isLoading, sendMessage };
}
