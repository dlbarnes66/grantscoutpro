"use client";

import { WorkspaceSidebar } from "./components/WorkspaceSidebar";

export default function WorkspaceShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      {/* Sidebar */}
      <div className="col-span-1">
        <WorkspaceSidebar workspaceId={workspaceId} />
      </div>

      {/* Main Content */}
      <div className="col-span-3">
        {children}
      </div>
    </div>
  );
}
