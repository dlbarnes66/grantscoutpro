"use client"

import { useState } from "react";
import GrantIntelligenceSidebar from "./GrantIntelligenceSidebar";
import PanelSwitcher from "./PanelSwitcher";

export default function DocumentIntelligence({
  workspaceId,
  documentId,
  userId,
  content,
  profile,
  cursorContext
}) {
  const [activePanel, setActivePanel] = useState("risk");

  return (
    <div className="flex h-full w-full bg-gray-100">
      {/* Sidebar */}
      <GrantIntelligenceSidebar
        activePanel={activePanel}
        onSelectPanel={setActivePanel}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Panel Switcher */}
        <PanelSwitcher
          activePanel={activePanel}
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
          content={content}
          profile={profile}
          cursorContext={cursorContext}
        />
      </div>
    </div>
  );
}
