"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GrantDraftsPage({
  params,
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/grant/${grantId}/drafts`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load drafts");
        }

        setDrafts(data.drafts || data || []);
      } catch (err: any) {
        setError(err.message || "Error loading drafts");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [grantId]);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading drafts…</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-xl font-semibold">Error Loading Drafts</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Grant Drafts</h1>

        <Link
          href={`/dashboard/${workspaceId}/grant/${grantId}/drafts/new`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          + New Draft
        </Link>
      </div>

      {/* Empty State */}
      {drafts.length === 0 ? (
        <p className="text-gray-600">No drafts yet.</p>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/dashboard/${workspaceId}/grant/${grantId}/drafts/${draft.id}`}
              className="block rounded border border-gray-200 bg-white p-4 hover:bg-gray-50 transition"
            >
              <div className="text-gray-900 font-semibold">
                {draft.title || "Untitled Draft"}
              </div>

              <div className="text-gray-600 text-sm mt-1">
                {draft.content
                  ? draft.content.slice(0, 120)
                  : "No content yet…"}
              </div>

              <div className="text-gray-500 text-xs mt-2">
                Last updated:{" "}
                {draft.updatedAt
                  ? new Date(draft.updatedAt).toLocaleDateString()
                  : "Unknown"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
