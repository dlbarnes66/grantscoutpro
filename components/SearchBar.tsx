"use client";

import { useState } from "react";
import { useWorkspaceSearch } from "@/hooks/useWorkspaceSearch";

interface WorkspaceSearchResult {
  search: (query: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const { search, loading, error } =
    useWorkspaceSearch() as WorkspaceSearchResult;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!query.trim()) return;

    await search(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex items-center gap-2 p-2 border rounded-md bg-white shadow-sm"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your workspace…"
        className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>

      {error && (
        <span className="text-red-600 text-sm ml-2">
          {error}
        </span>
      )}
    </form>
  );
}
