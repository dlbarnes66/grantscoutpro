"use client";

import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceTopbar from "./WorkspaceTopbar";

export default function WorkspaceShell({
  children,
  title,
  subtitle,
  workspaceId,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  workspaceId: string;
}) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#0A1A2F] text-white">
      <WorkspaceSidebar workspaceId={workspaceId} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,229,255,0.10), transparent)",
          }}
        />
        <WorkspaceTopbar title={title} subtitle={subtitle} />
        <main className="relative flex-1 p-8 md:p-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
