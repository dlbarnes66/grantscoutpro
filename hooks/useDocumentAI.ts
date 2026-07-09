import { useState } from "react";

export function useDocumentAI(workspaceId: string, documentId: string) {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTool = async (tool: string) => {
    try {
      setIsLoading(true);
      setResult(null);

      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai`,
        {
          method: "POST",
          body: JSON.stringify({ tool }),
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "AI tool failed");

      setResult(json.result);
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, runTool };
}
