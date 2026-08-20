import { useState, useCallback } from "react";
import { writerClient } from "@/lib/writer/client";
import type { WriterTool } from "@/lib/writer/client";

interface UseWriterResult {
  runWriter: (tool: WriterTool, prompt: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  output: string | null;
}

export function useWriter(
  workspaceId: string,
  documentId: string
): UseWriterResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);

  const runWriter = useCallback(
    async (tool: WriterTool, prompt: string): Promise<string> => {
      setLoading(true);
      setError(null);
      setOutput(null);

      try {
        const result = await writerClient({
          workspaceId,
          documentId,
          prompt,
          tool
        });

        setOutput(result.output);
        return result.output;
      } catch (err: any) {
        const message = err?.message ?? "Writer request failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, documentId]
  );

  return {
    runWriter,
    loading,
    error,
    output
  };
}
