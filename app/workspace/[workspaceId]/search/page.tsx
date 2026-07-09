"use client";

import { useState } from "react";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSearchPage({ params }: { params: { workspaceId: string } }) {
  const [query, setQuery] = useState("");
  const { data, isLoading, error, search } = useSemanticSearch(params.workspaceId);

  const handleSearch = () => {
    if (!query.trim()) return;
    search(query);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Semantic Search</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Search documents, grants, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      )}

      {error && (
        <Card className="p-4 border-red-500">
          <p className="text-red-600">Error: {error.message}</p>
        </Card>
      )}

      {!isLoading && data && data.results.length === 0 && (
        <Card className="p-4">
          <p className="text-gray-600">No results found.</p>
        </Card>
      )}

      {!isLoading && data && data.results.length > 0 && (
        <ScrollArea className="h-[400px] border rounded-md p-4">
          <div className="space-y-4">
            {data.results.map((item: any, idx: number) => (
              <Card key={idx} className="p-4">
                <p className="font-semibold">{item.documentTitle}</p>
                <p className="text-sm text-gray-600">{item.snippet}</p>
                <p className="text-xs text-gray-500 mt-2">Score: {item.score.toFixed(4)}</p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
