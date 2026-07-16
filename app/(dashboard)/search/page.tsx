"use client";

import { useState } from "react";
import { useGrantSearch } from "@/hooks/useGrantSearch";
import { Search, ExternalLink, BookmarkPlus, Scale } from "lucide-react";

export default function GrantSearchPage() {
  const [query, setQuery] = useState("");
  const { results, loading, search } = useGrantSearch();

  function handleSubmit(e: any) {
    e.preventDefault();
    if (query.trim().length > 0) {
      search(query.trim());
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Search className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Grant Search
        </h1>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Search grants by title, funder, summary, eligibility..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 border rounded-lg"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-gray-600">
          Searching…
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query.length > 0 && (
        <div className="p-6 bg-white border rounded-xl shadow-sm text-gray-600">
          No grants found.
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((grant) => (
          <div
            key={grant.id}
            className="p-5 bg-white border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="text-gray-900 font-semibold">
                {grant.title}
              </div>

              <div className="text-gray-600 text-sm mt-1">
                {grant.funder}
              </div>

              <div className="text-gray-600 text-sm mt-1">
                Amount: {grant.amount ? `$${grant.amount}` : "N/A"}
              </div>

              <div className="text-gray-500 text-xs mt-2">
                Deadline:{" "}
                {grant.deadline
                  ? new Date(grant.deadline).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/grants/${grant.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View
              </a>

              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Save
              </button>

              <a
                href={`/compare?ids=${grant.id}`}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                Compare
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
