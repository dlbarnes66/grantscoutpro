"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";
import Link from "next/link";

export default function SavedGrantsPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      const res = await fetch("/api/saved-grants");
      const data = await res.json();
      setGrants(data || []);
      setLoading(false);
    };

    loadSaved();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-muted">
        Loading saved grants…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900">Saved Grants</h1>
        <p className="text-muted mt-2">
          View and manage grants you've saved for later review.
        </p>

        {/* Empty State */}
        {grants.length === 0 && (
          <div className="card mt-10 text-center py-12">
            <p className="text-muted text-lg">You haven’t saved any grants yet.</p>
            <Link href="/search" className="btn btn-primary mt-6">
              Search Grants
            </Link>
          </div>
        )}

        {/* Saved Grants List */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {grants.map((grant) => (
            <div key={grant.id} className="card hover-card">

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {grant.title}
              </h2>

              {/* Agency */}
              {grant.agency && (
                <p className="text-muted mt-1">{grant.agency}</p>
              )}

              {/* Metadata */}
              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Amount:</span>{" "}
                  {grant.amount || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Deadline:</span>{" "}
                  {grant.deadline || "N/A"}
                </p>
              </div>

              {/* Summary */}
              <p className="mt-4 text-gray-700 text-sm leading-relaxed line-clamp-4">
                {grant.summary || "No summary available."}
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/grants/${grant.id}`}
                  className="btn btn-success w-full text-center"
                >
                  View Details
                </Link>

                <Link
                  href={`/grants/${grant.id}/write`}
                  className="btn btn-primary w-full text-center"
                >
                  Write with AI
                </Link>

                <button
                  onClick={async () => {
                    await fetch(`/api/saved-grants/delete`, {
                      method: "POST",
                      body: JSON.stringify({ id: grant.id }),
                    });
                    setGrants((prev) => prev.filter((g) => g.id !== grant.id));
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
