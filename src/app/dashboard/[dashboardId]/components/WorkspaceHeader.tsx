"use client";

import { useWorkspace } from "../context/WorkspaceContext";

export function WorkspaceHeader() {
  const workspace = useWorkspace();

  return (
    <header className="border-b p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">{workspace.name}</h2>
    </header>
  );
}
