"use client";

import { useState } from "react";

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex gap-2 p-4 border-b">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search grants..."
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        onClick={() => onSearch(query)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Search
      </button>
    </div>
  );
}
