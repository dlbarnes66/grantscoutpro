"use client";

import React from "react";

export function RoleManager({
  roles = [],
  onChangeRoleAction,
}: {
  roles?: Array<{ id: string; name: string; role: string }>;
  onChangeRoleAction?: (updated: any[]) => void;
}) {
  const updateRole = (id: string, role: string) => {
    const updated = roles.map((r) =>
      r.id === id ? { ...r, role } : r
    );
    onChangeRoleAction?.(updated);
  };

  return (
    <div className="space-y-4">
      {roles.map((r) => (
        <div key={r.id} className="border p-3 rounded">
          <div className="font-medium">{r.name}</div>
          <select
            className="mt-2 p-2 border rounded"
            value={r.role}
            onChange={(e) => updateRole(r.id, e.target.value)}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ))}
    </div>
  );
}
