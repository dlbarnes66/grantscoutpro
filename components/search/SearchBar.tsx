"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function SearchBar({
  query,
  onChange,
  onSearch
}: {
  query: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" />
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search grants by keywords, funder, category..."
          className="w-full rounded-md bg-slate-800 border border-slate-700 pl-10 pr-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={onSearch}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-4 py-2 text-sm font-medium"
      >
        Search
      </button>
    </div>
  );
}
