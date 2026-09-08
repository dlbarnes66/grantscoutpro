"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SavedGrantEntry {
  id: string;
  grantId: string;
  createdAt: string;
  grant: {
    id: string;
    workspaceId: string;
    title: string;
    agency: string | null;
    amount: number | null;
    deadline: string | null;
    summary: string | null;
  };
}

export default function SavedGrantsPage() {
  const [entries, setEntries] = useState<SavedGrantEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const res = await fetch("/api/saved-grant");
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const data = await res.json();
        setEntries(data?.savedGrants || []);
      } catch (err) {
        console.error("Failed to load saved grants", err);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, []);

  async function removeSaved(grantId: string) {
    await fetch(`/api/saved-grant/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grantId }),
    });
    setEntries((prev) => prev.filter((e) => e.grantId !== grantId));
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Saved Grants</h1>
        <p className="text-muted mt-2">
          View and manage grants you've saved for later review.
        </p>

        {entries.length === 0 && (
          <div className="card mt-10 text-center py-12">
            <p className="text-muted text-lg">You haven't saved any grants yet.</p>
            <Link href="/workspace" className="btn btn-primary mt-6">
              Go to Your Workspaces
            </Link>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(({ grant }) => (
            <div key={grant.id} className="card hover-card">
              <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                {grant.title}
              </h2>

              {grant.agency && (
                <p className="text-muted mt-1">{grant.agency}</p>
              )}

              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Amount:</span>{" "}
                  {grant.amount != null
                    ? `$${grant.amount.toLocaleString()}`
                    : "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Deadline:</span>{" "}
                  {grant.deadline
                    ? new Date(grant.deadline).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <p className="mt-4 text-gray-700 text-sm leading-relaxed line-clamp-4">
                {grant.summary || "No summary available."}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/grants/${grant.id}`}
                  className="btn btn-success w-full text-center"
                >
                  View Details
                </Link>

                <Link
                  href={`/workspace/${grant.workspaceId}/documents`}
                  className="btn btn-primary w-full text-center"
                >
                  Write with AI
                </Link>

                <button
                  onClick={() => removeSaved(grant.id)}
                  className="btn btn-danger w-full"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/workspace" className="text-muted underline">
            ← Back to Workspaces
          </Link>
        </div>
      </div>
    </div>
  );
}
