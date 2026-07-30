"use client";

import { useEffect, useState } from "react";
import { SavedList } from "./components/SavedList";

export default function SavedPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;

  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/saved?workspaceId=${workspaceId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load saved grants");
        }

        setGrants(data.grants || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [workspaceId]);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading saved grants…</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        <h2 className="text-xl font-semibold">Error Loading Saved Grants</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Saved Grants</h1>

      {grants.length === 0 ? (
        <p className="text-gray-600">You haven’t saved any grants yet.</p>
      ) : (
        <SavedList grants={grants} workspaceId={workspaceId} />
      )}
    </div>
  );
}
