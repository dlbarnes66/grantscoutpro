"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SavedSearchEntry {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}

export default function SearchHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searches, setSearches] = useState<SavedSearchEntry[]>([]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/saved-searches");
      const data = await res.json();
      setSearches(data?.searches || []);
    } catch (err) {
      console.error("Failed to load search history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  async function deleteSearch(id: string) {
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  async function runAgain(id: string) {
    try {
      const res = await fetch("/api/saved-searches/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId: id }),
      });
      const data = await res.json();
      if (data?.query) {
        // Real grant search happens inside a workspace - hand the saved
        // query off there rather than a top-level page that has no
        // workspace context to search within.
        router.push(`/workspace?q=${encodeURIComponent(data.query)}`);
      }
    } catch (err) {
      console.error("Failed to run saved search", err);
    }
  }

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
          Review and re-run your previously saved searches.
        </p>

        {searches.length === 0 && (
          <div className="mt-10 bg-white p-10 rounded-xl shadow border border-gray-200 text-center">
            <p className="text-gray-600 text-lg">
              You haven't saved any searches yet.
            </p>

            <Link
              href="/workspace"
              className="inline-block mt-6 px-6 py-3 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Go to Your Workspaces
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {searches.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.name || "Saved Search"}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Saved on {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  <p className="mt-3 text-gray-700 text-sm">
                    <span className="font-medium">Query:</span> {item.query}
                  </p>
                </div>

                <button
                  onClick={() => deleteSearch(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => runAgain(item.id)}
                  className="inline-block px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
                >
                  Run Again
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
