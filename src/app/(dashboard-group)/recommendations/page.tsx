"use client"
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useRecommendations } from "@/hooks/useRecommendations";
import { Sparkles, ExternalLink, BookmarkPlus } from "lucide-react";

export default function RecommendationsPage() {
  const { recommendations, loading } = useRecommendations();

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading recommendations…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Recommendations
        </h1>
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div className="p-6 bg-white border rounded-xl shadow-sm text-gray-600">
          No recommendations yet. Upload documents to get personalized grant suggestions.
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-5 bg-white border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div className="text-gray-900 font-medium">
              {rec.text}
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
