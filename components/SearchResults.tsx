"use client";

import { useWorkspaceSearch } from "@/hooks/useWorkspaceSearch";
import { FileText, Sparkles } from "lucide-react";

interface WorkspaceSearchResultItem {
  id: string;
  title?: string;
  summary?: string;
  matchScore: number;
}

interface WorkspaceSearchHookResult {
  results: WorkspaceSearchResultItem[] | null;
  loading: boolean;
  cached: boolean;
  error: string | null;
}

export default function SearchResults() {
  const { results, loading, cached, error } =
    useWorkspaceSearch() as WorkspaceSearchHookResult;

  if (loading) {
    return (
      <div className="mt-6 flex items-center gap-2 text-gray-600 animate-pulse">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <span>Scanning your workspace for the best matches…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="mt-6 p-6 border border-dashed border-gray-300 bg-white rounded-xl text-center text-gray-500">
        <p className="mb-2">No results yet.</p>
        <p className="text-sm">
          Try searching for a grant type, eligibility requirement, or funding focus.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {cached && (
        <div className="text-xs text-blue-600 flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          <span>Results loaded from cache for faster performance</span>
        </div>
      )}

      {results.map((doc) => (
        <div
          key={doc.id}
          className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-gray-400 mt-1" />

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {doc.title || "Untitled Document"}
              </h3>

              {doc.summary && (
                <p className="text-gray-700 mt-1">{doc.summary}</p>
              )}

              <div className="mt-2 text-xs text-gray-500">
                Match Score: {doc.matchScore.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
