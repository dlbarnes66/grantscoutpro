"use client";

import { useState } from "react";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspaceSearchPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;
  const [query, setQuery] = useState("");

  const { results, loading, search } = useSemanticSearch();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    await search();
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

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r: any, idx: number) => (
            <Card key={idx} className="p-4">
              <p className="font-semibold">Result {idx + 1}</p>
              <p className="text-sm text-gray-400 mt-1">
                {JSON.stringify(r)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <p className="text-sm text-gray-500">No results found.</p>
      )}
    </WorkspaceShell>
  );
}
