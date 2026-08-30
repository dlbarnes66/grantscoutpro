"use client";

import React from "react";
import Card from "@/components/ui/Card";

export function SearchResults({
  results = [],
}: {
  results?: Array<{ id: string; title: string; snippet?: string }>;
}) {
  if (!results.length) {
    return (
      <div className="text-sm text-gray-500 p-4 border rounded bg-white">
        No results found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="font-semibold">{r.title}</div>
          {r.snippet && (
            <div className="text-sm text-gray-600 mt-1">{r.snippet}</div>
          )}
        </Card>
      ))}
    </div>
  );
}
