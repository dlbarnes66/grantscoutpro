"use client";

import { createContext, useContext } from "react";

export type WorkspaceContextType = {
  id: string;
  name: string;

  // AI usage summary (NOT array)
  aiUsage: {
    tokensUsed: number;
    cost: number;
  };

  // Add anything else your layout passes here
  [key: string]: any;
};

export const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside WorkspaceContext.Provider");
  }
  return ctx;
}
