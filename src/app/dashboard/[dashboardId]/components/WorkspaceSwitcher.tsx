"use client";

import Link from "next/link";

export function WorkspaceSwitcher({
  workspaces,
}: {
  workspaces: { id: string; name: string }[];
}) {
  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold mb-2">Switch Workspace</h3>
      <ul className="space-y-2">
        {workspaces.map(ws => (
          <li key={ws.id}>
            <Link
              href={`/dashboard/${ws.id}`}
              className="text-blue-600 hover:underline"
            >
              {ws.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
