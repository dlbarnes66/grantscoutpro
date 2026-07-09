import { useState } from "react";

export function useSemanticSearch(workspaceId: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const search = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/workspaces/${workspaceId}/search`, {
        method: "POST",
        body: JSON.stringify({ query }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Search failed");

      setData(json);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, search };
}
