"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspaceSearchPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { results, loading, error, search } = useSemanticSearch(workspaceId);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(true);
    await search(query);
  }

  return (
    <WorkspaceShell title="Semantic Search" workspaceId={workspaceId}>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across documents..."
          className="flex-1"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, idx) => (
            <Card key={`${r.documentId}-${idx}`} className="p-4">
              <p className="font-semibold">{r.documentName || "Untitled document"}</p>
              <p className="text-sm text-gray-400 mt-1 line-clamp-3">
                {r.snippet}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Relevance: {(r.score * 100).toFixed(0)}%
                {r.updatedAt
                  ? ` · Updated ${new Date(r.updatedAt).toLocaleDateString()}`
                  : ""}
              </p>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && submitted && results.length === 0 && (
        <p className="text-sm text-gray-500">No results found.</p>
      )}
    </WorkspaceShell>
  );
}
