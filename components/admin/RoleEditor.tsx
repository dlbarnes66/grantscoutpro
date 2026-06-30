"use client";

import { useState } from "react";

export function RoleEditor({
  user,
  onUpdate
}: {
  user: any;
  onUpdate: (u: any) => void;
}) {
  const [role, setRole] = useState(user.role);

  function save() {
    onUpdate({ ...user, role });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Role & Permissions — {user.name}
      </h2>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      >
        <option value="Owner">Owner</option>
        <option value="Admin">Admin</option>
        <option value="Editor">Editor</option>
        <option value="Reviewer">Reviewer</option>
        <option value="Viewer">Viewer</option>
      </select>

      <button
        onClick={save}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
      >
        Save Role
      </button>
    </div>
  );
}
