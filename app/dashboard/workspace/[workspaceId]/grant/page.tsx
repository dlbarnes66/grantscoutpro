"use client";

import { useEffect, useState } from "react";
import GrantWorkspaceCard from "./GrantWorkspaceCard";

export default function GrantWorkspacePage({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/workspace/${workspaceId}/grants`);
      const json = await res.json();
      setGrants(json.grants || []);
      setLoading(false);
    }
    load();
  }, [workspaceId]);

  if (loading) {
    return <p className="p-6 text-lg">Loading grants...</p>;
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Grant Workspace</h1>

      <p className="text-gray-700">
        Select a grant below to open its dashboard, narrative builder, intelligence report, tracking, or submission tools.
      </p>

      <div className="space-y-4">
        {grants.map((grant) => (
          <GrantWorkspaceCard
            key={grant.id}
            grant={grant}
            workspaceId={workspaceId}
          />
        ))}
      </div>

      <a
        href={`/dashboard/workspace/${workspaceId}/grant/create`}
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-semibold"
      >
        + Create New Grant
      </a>
    </div>
  );
}
