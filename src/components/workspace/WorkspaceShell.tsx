"use client";

import { useEffect, useState } from "react";
import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceTopbar from "./WorkspaceTopbar";
import WorkspaceHelpChatWidget from "./WorkspaceHelpChatWidget";
import PilotBanner from "./PilotBanner";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export default function WorkspaceShell({
  children,
  title,
  workspaceId,
}: {
  children: React.ReactNode;
  title: string;
  workspaceId: string;
}) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If the window grows back past the breakpoint (e.g. rotating a
  // tablet, or resizing a browser window) while the mobile drawer
  // happens to be open, drop back to the normal desktop layout instead
  // of leaving a fixed-position drawer stuck on screen.
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <div
      className="flex min-h-screen overflow-x-hidden bg-[#0A1A2F] text-white"
      style={{ display: "flex", minHeight: "100vh", overflowX: "hidden", background: "#0A1A2F", color: "#fff" }}
    >
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}

      <div
        style={
          isMobile
            ? {
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                zIndex: 50,
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 200ms ease",
                boxShadow: sidebarOpen ? "2px 0 16px rgba(0,0,0,0.4)" : "none",
              }
            : undefined
        }
      >
        <WorkspaceSidebar
          workspaceId={workspaceId}
          onNavigate={isMobile ? () => setSidebarOpen(false) : undefined}
        />
      </div>

      <div
        className="flex min-w-0 flex-1 flex-col"
        style={{ display: "flex", minWidth: 0, flex: "1 1 0%", flexDirection: "column" }}
      >
        <WorkspaceTopbar
          title={title}
          onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
        />
        <main className="flex-1 px-8 py-7" style={{ flex: "1 1 0%", padding: isMobile ? "20px 16px" : "28px 32px" }}>
          <div className="mx-auto max-w-6xl" style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 1152 }}>
            <PilotBanner />
            {children}
          </div>
        </main>
      </div>

      <WorkspaceHelpChatWidget workspaceId={workspaceId} />
    </div>
  );
}
