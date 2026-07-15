"use client";

import { useState } from "react";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function WorkspaceSearchPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;
  const [query, setQuery] = useState("");

  const { data, isLoading, error, search } = useSemanticSearch(workspaceId);
  const results = (data as any[]) || [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    search(query);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Semantic Search</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across documents..."
          className="flex-1"
        />

        <div
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 flex items-center justify-center"
        >
          Search
        </div>
      </form>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{String(error)}</p>
        </Card>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r: any) => (
            <Card key={r.id} className="p-4">
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-gray-600 mt-1">{r.snippet}</p>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && results.length === 0 && query && (
        <p className="text-sm text-gray-500">No results found.</p>
      )}
    </div>
  );
}
