"use client";

import { useSearchHistory } from "@/hooks/useSearchHistory";
import { History, Search } from "lucide-react";

export default function SearchHistoryPage() {
  const { history, loading } = useSearchHistory();

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading search history…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <History className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Search History
        </h1>
      </div>

      {/* Empty State */}
      {history.length === 0 && (
        <div className="p-6 bg-white border rounded-xl shadow-sm text-gray-600">
          No searches yet. Try searching for grants.
        </div>
      )}

      {/* History List */}
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="text-gray-900 font-medium">
                {item.query}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {new Date(item.createdAt).toLocaleString()} • {item.resultCount} results
              </div>
            </div>

            <a
              href={`/search?query=${encodeURIComponent(item.query)}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Repeat Search
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
