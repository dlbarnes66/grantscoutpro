"use client"

import { useEffect, useState } from "react";
import { GrantListItem } from "./types";

export default function GrantList({ workspaceId }: { workspaceId: string }) {
  const [grants, setGrants] = useState<GrantListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrants() {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/list`);
      const data: GrantListItem[] = await res.json();
      setGrants(data);
      setLoading(false);
    }

    loadGrants();
  }, [workspaceId]);

  if (loading) {
    return <div className="p-4">Loading grants…</div>;
  }

  if (grants.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        No grants available for your permission level.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {grants.map((grant) => (
        <a
          key={grant.id}
          href={`/workspace/${workspaceId}/grants/${grant.id}`}
          className="block p-3 border rounded hover:bg-gray-50"
        >
          <div className="font-semibold">{grant.title}</div>
          <div className="text-sm text-gray-600">
            {grant.agency} — Deadline: {grant.deadline}
          </div>
        </a>
      ))}
    </div>
  );
}
