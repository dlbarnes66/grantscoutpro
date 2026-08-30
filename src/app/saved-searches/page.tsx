"use client"
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";
import Link from "next/link";

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      const res = await fetch("/api/saved-searches");
      const data = await res.json();
      setSearches(data || []);
      setLoading(false);
    };

    loadSaved();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-muted">
        Loading saved searches…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
        <p className="text-muted mt-2">
          Quickly re-run your previous searches or manage saved queries.
        </p>

        {/* Empty State */}
        {searches.length === 0 && (
          <div className="card mt-10 text-center py-12">
            <p className="text-muted text-lg">You haven’t saved any searches yet.</p>
            <Link href="/search" className="btn btn-primary mt-6">
              Search Grants
            </Link>
          </div>
        )}

        {/* Saved Searches List */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searches.map((search) => (
            <div key={search.id} className="card hover-card">

              {/* Query */}
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {search.query}
              </h2>

              {/* Timestamp */}
              <p className="text-muted text-sm mt-1">
                Saved on {new Date(search.createdAt).toLocaleDateString()}
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/search?query=${encodeURIComponent(search.query)}`}
                  className="btn btn-success w-full text-center"
                >
                  Run Search
                </Link>

                <button
                  onClick={async () => {
                    await fetch(`/api/saved-searches/${search.id}`, {
                      method: "DELETE",
                    });
                    setSearches((prev) => prev.filter((s) => s.id !== search.id));
                  }}
                  className="btn btn-danger w-full"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back Link */}
        <div className="mt-12">
          <Link href="/search" className="text-muted underline">
            ← Back to Search
          </Link>
        </div>
      </div>
    </div>
  );
}
