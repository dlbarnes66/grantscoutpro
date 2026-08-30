"use client";

import Link from "next/link";

export default function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  return (
    <aside className="w-64 bg-[#11233F] p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4">Workspace</h2>

      <nav className="flex flex-col gap-4 text-lg">
        <Link
          href={`/workspace/${workspaceId}`}
          className="hover:text-[#00E5FF] transition"
        >
          Overview
        </Link>

        <Link
          href={`/workspace/${workspaceId}/grants`}
          className="hover:text-[#00E5FF] transition"
        >
          Grants
        </Link>

        <Link
          href={`/workspace/${workspaceId}/documents`}
          className="hover:text-[#00E5FF] transition"
        >
          Documents
        </Link>

        <Link
          href={`/workspace/${workspaceId}/analytics`}
          className="hover:text-[#00E5FF] transition"
        >
          Analytics
        </Link>

        <Link
          href={`/workspace/${workspaceId}/settings`}
          className="hover:text-[#00E5FF] transition"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
