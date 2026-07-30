"use client";

import React, { createContext, useContext } from "react";

export interface WorkspaceContextType {
  workspaceId: string | null;
  workspaceName: string | null;
  role: string | null;
  subscriptionTier: string | null;
  trialActive: boolean;
  trialDaysRemaining: number | null;
  trialLocked: boolean;
  aiTokensUsed: number;
  aiCost: number;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceId: null,
  workspaceName: null,
  role: null,
  subscriptionTier: null,
  trialActive: false,
  trialDaysRemaining: null,
  trialLocked: false,
  aiTokensUsed: 0,
  aiCost: 0,
});

export function WorkspaceProvider({
  value,
  children,
}: {
  value: WorkspaceContextType;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
