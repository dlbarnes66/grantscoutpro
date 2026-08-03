// lib/planCapabilities.ts

export type PlanCapabilities = {
  aiAutomation: boolean;
  aiSummary: boolean;
  aiScores: boolean;
  compare: boolean;
  exportData: boolean;
  workspaceLimit: number;
  aiWriter: boolean;
  grantMatching: boolean;
  crm: boolean;
  scoringEngine: boolean;
  advancedReporting: boolean;
  complianceAutomation: boolean;
  budgetAutomation: boolean;
  maxUsers: number;
  vaultExpansionIncluded: boolean;
  packetExpansionIncluded: boolean;
};

export const PLAN_CAPABILITIES: Record<string, PlanCapabilities> = {
  free: {
    aiAutomation: false,
    aiSummary: false,
    aiScores: false,
    compare: false,
    exportData: false,
    workspaceLimit: 1,
    aiWriter: false,
    grantMatching: false,
    crm: false,
    scoringEngine: false,
    advancedReporting: false,
    complianceAutomation: false,
    budgetAutomation: false,
    maxUsers: 1,
    vaultExpansionIncluded: false,
    packetExpansionIncluded: false,
  },

  starter: {
    aiAutomation: true,
    aiSummary: true,
    aiScores: true,
    compare: true,
    exportData: false,
    workspaceLimit: 3,
    aiWriter: true,
    grantMatching: true,
    crm: true,
    scoringEngine: true,
    advancedReporting: true,
    complianceAutomation: true,
    budgetAutomation: true,
    maxUsers: 3,
    vaultExpansionIncluded: true,
    packetExpansionIncluded: true,
  },

  pro: {
    aiAutomation: true,
    aiSummary: true,
    aiScores: true,
    compare: true,
    exportData: true,
    workspaceLimit: 10,
    aiWriter: true,
    grantMatching: true,
    crm: true,
    scoringEngine: true,
    advancedReporting: true,
    complianceAutomation: true,
    budgetAutomation: true,
    maxUsers: 10,
    vaultExpansionIncluded: true,
    packetExpansionIncluded: true,
  },

  enterprise: {
    aiAutomation: true,
    aiSummary: true,
    aiScores: true,
    compare: true,
    exportData: true,
    workspaceLimit: 999,
    aiWriter: true,
    grantMatching: true,
    crm: true,
    scoringEngine: true,
    advancedReporting: true,
    complianceAutomation: true,
    budgetAutomation: true,
    maxUsers: 999,
    vaultExpansionIncluded: true,
    packetExpansionIncluded: true,
  },
};

export type PlanName = keyof typeof PLAN_CAPABILITIES;
