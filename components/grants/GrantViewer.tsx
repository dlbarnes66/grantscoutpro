"use client";

import { useState, useEffect } from "react";
import { useGrantACL } from "@/lib/security/useGrantACL";
import { GrantViewerData, GrantACL } from "./types";

export default function GrantViewer({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const acl: GrantACL = useGrantACL(workspaceId, grantId);

  const [grant, setGrant] = useState<GrantViewerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrant() {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/grants/${grantId}/viewer`
      );
      const data: GrantViewerData = await res.json();
      setGrant(data);
      setLoading(false);
    }

    loadGrant();
  }, [workspaceId, grantId]);

  if (acl.loading || loading || !grant) {
    return <div className="p-4">Loading grant…</div>;
  }

  if (!acl.canView) {
    return (
      <div className="p-4 text-red-600">
        You do not have permission to view this grant.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{grant.title}</h1>

      <div className="text-gray-700 mb-4">
        <strong>Agency:</strong> {grant.agency}
        <br />
        <strong>Deadline:</strong> {grant.deadline}
      </div>

      <div className="border p-4 rounded bg-gray-50 whitespace-pre-wrap">
        {grant.summary}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Last updated: {new Date(grant.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
