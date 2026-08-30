"use client";

import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceTopbar from "./WorkspaceTopbar";

export default function WorkspaceShell({
  children,
  title,
  workspaceId,
}: {
  children: React.ReactNode;
  title: string;
  workspaceId: string;
}) {
  return (
    <div className="flex min-h-screen bg-[#0A1A2F] text-white">

      <WorkspaceSidebar workspaceId={workspaceId} />

      <div className="flex-1 flex flex-col">
        <WorkspaceTopbar title={title} />
        <main className="p-10">{children}</main>
      </div>
    </div>
  );
}
