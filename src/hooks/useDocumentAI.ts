"use client";

import { useState } from "react";

export type AiMode =
  | "summarize"
  | "rewrite"
  | "extract"
  | "improve"
  | "tone"
  | "compliance"
  | "reviewer_simulation"
  | "score"
  | "risk"
  | "fit"
  | "enhance";

interface AiResponse {
  mode: AiMode;
  model: string;
  result: string;
  tokensUsed: number;
}

export function useDocumentAI(workspaceId: string, documentId: string) {
  const [loading, setLoading] = useState<AiMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAiAction(mode: AiMode, payload: any = {}): Promise<AiResponse | null> {
    try {
      setLoading(mode);
      setError(null);

      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, ...payload }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "AI request failed");
        return null;
      }

      return data as AiResponse;
    } catch (err: any) {
      setError(err?.message ?? "Unknown AI error");
      return null;
    } finally {
      setLoading(null);
    }
  }

  return {
    loading,
    error,
    runAiAction,
  };
}
