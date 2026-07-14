"use client";

import { useEffect, useState } from "react";
import { useWorkspaceACL } from "@/lib/security/useWorkspaceACL";

export default function WorkspaceAnalyticsPanel({ workspaceId }) {
  const acl = useWorkspaceACL(workspaceId);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  if (acl.loading) {
    return <div className="p-4">Loading permissions…</div>;
  }

  if (!acl.canManageMembers) {
    return null; // auto-hide for non-admins
  }

  useEffect(() => {
    async function loadAnalytics() {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics`);
      const data = await res.json();
      setAnalytics(data);
      setLoading(false);
    }

    loadAnalytics();
  }, [workspaceId]);

  if (loading) {
    return <div className="p-4">Loading analytics…</div>;
  }

  return (
    <div className="p-4 border rounded bg-white shadow space-y-4">
      <h2 className="text-xl font-bold">Workspace Analytics</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 border rounded bg-gray-50">
          <div className="text-sm text-gray-600">Documents</div>
          <div className="text-2xl font-bold">{analytics.documentCount}</div>
        </div>

        <div className="p-3 border rounded bg-gray-50">
          <div className="text-sm text-gray-600">Grants</div>
          <div className="text-2xl font-bold">{analytics.grantCount}</div>
        </div>

        <div className="p-3 border rounded bg-gray-50">
          <div className="text-sm text-gray-600">AI Usage</div>
          <div className="text-2xl font-bold">{analytics.aiUsage}</div>
        </div>
      </div>
    </div>
  );
}
