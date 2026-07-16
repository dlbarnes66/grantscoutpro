"use client";

import { useSavedGrants } from "@/hooks/useSavedGrants";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";

export default function SavedGrantsPage() {
  const { saved, loading } = useSavedGrants();

  async function removeSaved(id: string) {
    await fetch(`/api/saved-grants/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading saved grants…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bookmark className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Saved Grants
        </h1>
      </div>

      {/* Empty State */}
      {saved.length === 0 && (
        <div className="p-6 bg-white border rounded-xl shadow-sm text-gray-600">
          You haven’t saved any grants yet.
        </div>
      )}

      {/* Saved Grants List */}
      <div className="space-y-4">
        {saved.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="text-gray-900 font-semibold">
                {item.grant.title}
              </div>

              <div className="text-gray-600 text-sm mt-1">
                {item.grant.funder}
              </div>

              <div className="text-gray-600 text-sm mt-1">
                Amount: {item.grant.amount ? `$${item.grant.amount}` : "N/A"}
              </div>

              <div className="text-gray-500 text-xs mt-2">
                Saved on {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/grants/${item.grantId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View
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
