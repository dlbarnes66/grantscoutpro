"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";
import Link from "next/link";

interface HistoryItem {
  id: string;
  title: string | null;
  createdAt: string;
  filters: Record<string, any>;
}

export default function SearchHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/search-history");
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load search history", err);
    }
    setLoading(false);
  };

  const deleteHistoryItem = async (id: string) => {
    await fetch(`/api/search-history/${id}`, { method: "DELETE" });
    loadHistory();
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading search history…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900">Search History</h1>
        <p className="text-gray-600 mt-2">
          Review and re-run your previous grant searches.
        </p>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="mt-10 bg-white p-10 rounded-xl shadow border border-gray-200 text-center">
            <p className="text-gray-600 text-lg">You haven’t run any searches yet.</p>

            <Link
              href="/search"
              className="inline-block mt-6 px-6 py-3 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Start a Search
            </Link>
          </div>
        )}

        {/* History List */}
        <div className="mt-10 space-y-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title || "Previous Search"}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Ran on {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  {/* Filters Summary */}
                  <div className="mt-3 text-gray-700 text-sm">
                    {Object.entries(item.filters).map(([key, value]) => (
                      <p key={key}>
                        <span className="font-medium capitalize">{key}:</span>{" "}
                        {Array.isArray(value) ? value.join(", ") : value}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>

              {/* Run Again Button */}
              <div className="mt-6">
                <Link
                  href={`/search/results?id=${item.id}`}
                  className="inline-block px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
                >
                  Run Again
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
