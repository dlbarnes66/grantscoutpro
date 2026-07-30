"use client";

import { MemberItem } from "./types";

export function RoleManager({ members }: { members: MemberItem[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Roles & Permissions
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <span>{m.name}</span>

            <select
              defaultValue={m.role}
              className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            >
              <option value="Owner">Owner</option>
              <option value="Editor">Editor</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Viewer">Viewer</option>
            </select>
          </li>
        ))}
      </ul>

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Save Permissions
      </button>
    </div>
  );
}
