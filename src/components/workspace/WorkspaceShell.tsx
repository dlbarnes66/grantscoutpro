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
    <div className="flex min-h-screen overflow-x-hidden bg-[#0A1A2F] text-white">
      <WorkspaceSidebar workspaceId={workspaceId} />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceTopbar title={title} />
        <main className="flex-1 px-8 py-7">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
