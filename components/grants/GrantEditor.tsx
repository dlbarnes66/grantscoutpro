"use client";

import { useState, useEffect } from "react";
import { useGrantACL } from "@/lib/security/useGrantACL";

export default function GrantEditor({ workspaceId, grantId }) {
  const acl = useGrantACL(workspaceId, grantId);

  const [grant, setGrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load grant content
  useEffect(() => {
    async function loadGrant() {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/grants/${grantId}/editor`
      );
      const data = await res.json();
      setGrant(data);
      setLoading(false);
    }

    loadGrant();
  }, [workspaceId, grantId]);

  if (acl.loading || loading) {
    return <div className="p-4">Loading grant…</div>;
  }

  // Block view entirely
  if (!acl.canView) {
    return (
      <div className="p-4 text-red-600">
        You do not have permission to view this grant.
      </div>
    );
  }

  async function save() {
    if (!acl.canEdit) return;

    setSaving(true);

    await fetch(
      `/api/workspaces/${workspaceId}/grants/${grantId}/editor`,
      {
        method: "POST",
        body: JSON.stringify({
          title: grant.title,
          agency: grant.agency,
          deadline: grant.deadline,
          summary: grant.summary,
        }),
      }
    );

    setSaving(false);
  }

  return (
    <div className="p-4 space-y-4">

      <input
        type="text"
        value={grant.title}
        disabled={!acl.canEdit}
        onChange={(e) => setGrant({ ...grant, title: e.target.value })}
        className={`w-full p-2 border rounded ${
          !acl.canEdit ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />

      <input
        type="text"
        value={grant.agency}
        disabled={!acl.canEdit}
        onChange={(e) => setGrant({ ...grant, agency: e.target.value })}
        className={`w-full p-2 border rounded ${
          !acl.canEdit ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />

      <input
        type="date"
        value={grant.deadline}
        disabled={!acl.canEdit}
        onChange={(e) => setGrant({ ...grant, deadline: e.target.value })}
        className={`w-full p-2 border rounded ${
          !acl.canEdit ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />

      <textarea
        value={grant.summary}
        disabled={!acl.canEdit}
        onChange={(e) => setGrant({ ...grant, summary: e.target.value })}
        className={`w-full h-64 p-2 border rounded ${
          !acl.canEdit ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
      />

      <button
        onClick={save}
        disabled={!acl.canEdit || saving}
        className={`px-4 py-2 rounded text-white ${
          acl.canEdit
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {saving ? "Saving…" : "Save"}
      </button>

      {!acl.canEdit && (
        <div className="text-yellow-600">
          You can view this grant but cannot edit it.
        </div>
      )}
    </div>
  );
}
