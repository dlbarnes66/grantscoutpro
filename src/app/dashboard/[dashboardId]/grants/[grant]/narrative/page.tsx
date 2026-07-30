"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NarrativePage({
  params,
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  const [narratives, setNarratives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/grant/${grantId}/narrative`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load narrative entries");
        }

        setNarratives(data.entries || data || []);
      } catch (err: any) {
        setError(err.message || "Error loading narrative entries");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [grantId]);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading narrative…</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-xl font-semibold">Error Loading Narrative</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Narrative</h1>

        <Link
          href={`/dashboard/${workspaceId}/grant/${grantId}/narrative/new`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          + New Narrative Entry
        </Link>
      </div>

      {/* Empty State */}
      {narratives.length === 0 ? (
        <p className="text-gray-600">No narrative entries yet.</p>
      ) : (
        <div className="space-y-3">
          {narratives.map((entry) => (
            <Link
              key={entry.id}
              href={`/dashboard/${workspaceId}/grant/${grantId}/narrative/${entry.id}`}
              className="block rounded border border-gray-200 bg-white p-4 hover:bg-gray-50 transition"
            >
              <div className="text-gray-900 font-semibold">
                Entry from{" "}
                {entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </div>

              <div className="text-gray-600 text-sm mt-1">
                {entry.content
                  ? entry.content.slice(0, 120)
                  : "No content yet…"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
