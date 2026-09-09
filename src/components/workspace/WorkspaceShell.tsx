"use client";

import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceTopbar from "./WorkspaceTopbar";
import WorkspaceHelpChatWidget from "./WorkspaceHelpChatWidget";

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
    <div
      className="flex min-h-screen overflow-x-hidden bg-[#0A1A2F] text-white"
      style={{ display: "flex", minHeight: "100vh", overflowX: "hidden", background: "#0A1A2F", color: "#fff" }}
    >
      <WorkspaceSidebar workspaceId={workspaceId} />

      <div
        className="flex min-w-0 flex-1 flex-col"
        style={{ display: "flex", minWidth: 0, flex: "1 1 0%", flexDirection: "column" }}
      >
        <WorkspaceTopbar title={title} />
        <main className="flex-1 px-8 py-7" style={{ flex: "1 1 0%", padding: "28px 32px" }}>
          <div className="mx-auto max-w-6xl" style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 1152 }}>
            {children}
          </div>
        </main>
      </div>

      <WorkspaceHelpChatWidget workspaceId={workspaceId} />
    </div>
  );
}
