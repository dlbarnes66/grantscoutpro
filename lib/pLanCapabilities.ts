// lib/planCapabilities.ts

export type PlanCapabilities = {
  aiAutomation: boolean;
  aiSummary: boolean;
  aiScores: boolean;
  compare: boolean;
  exportData: boolean;
  workspaceLimit: number;
};

export const PLAN_CAPABILITIES: Record<string, PlanCapabilities> = {
  free: {
    aiAutomation: false,
    aiSummary: false,
    aiScores: false,
    compare: false,
    exportData: false,
    workspaceLimit: 1,
  },

  starter: {
    aiAutomation: true,
    aiSummary: true,
    aiScores: true,
    compare: true,
    exportData: false,
    workspaceLimit: 3,
  },

  pro: {
    aiAutomation: true,
    aiSummary: true,
    aiScores: true,
    compare: true,
    exportData: true,
    workspaceLimit: 10,
  },

  enterprise: {
    aiAutomation: true,
    aiSummary: true,
    aiScores: true,
    compare: true,
    exportData: true,
    workspaceLimit: 999,
  },
};
