"use client";

import { useSavedSearches } from "@/hooks/useSavedSearches";
import { Bookmark, Search, Trash2 } from "lucide-react";

export default function SavedSearchesPage() {
  const { saved, loading } = useSavedSearches();

  async function removeSaved(id: string) {
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading saved searches…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bookmark className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Saved Searches
        </h1>
      </div>

      {/* Empty State */}
      {saved.length === 0 && (
        <div className="p-6 bg-white border rounded-xl shadow-sm text-gray-600">
          You haven’t saved any searches yet.
        </div>
      )}

      {/* Saved Searches List */}
      <div className="space-y-4">
        {saved.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="text-gray-900 font-semibold">
                {item.query}
              </div>

              <div className="text-gray-500 text-xs mt-2">
                Saved on {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/search?query=${encodeURIComponent(item.query)}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Run Search
              </a>

              <button
                onClick={() => removeSaved(item.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
