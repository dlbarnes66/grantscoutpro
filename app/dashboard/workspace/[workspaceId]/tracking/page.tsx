"use client";

import { useEffect, useState } from "react";
import GrantTrackingCard from "./GrantTrackingCard";

export default function GrantTrackingPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrants() {
      const res = await fetch(`/api/workspace/${workspaceId}/grants`);
      const data = await res.json();
      setGrants(data.grants || []);
      setLoading(false);
    }
    loadGrants();
  }, [workspaceId]);

  if (loading) {
    return <p className="p-6 text-lg">Loading grants...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Tracking Dashboard</h1>

      <div className="space-y-4">
        {grants.map((grant) => (
          <GrantTrackingCard key={grant.id} grant={grant} />
        ))}
      </div>
    </div>
  );
}
