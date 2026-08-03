export type AddonKey =
  | "aiWriter"
  | "grantMatching"
  | "crm"
  | "scoringEngine"
  | "advancedReporting"
  | "complianceAutomation"
  | "budgetAutomation"
  | "extraSeats"
  | "vaultExpansion"
  | "packetExpansion";

export type AddonDefinition = {
  key: AddonKey;
  name: string;
  description: string;
};

export const ADDON_CAPABILITIES: Record<AddonKey, AddonDefinition> = {
  aiWriter: {
    key: "aiWriter",
    name: "AI Writer",
    description: "Generate grant narratives, summaries, and responses."
  },
  grantMatching: {
    key: "grantMatching",
    name: "Grant Matching",
    description: "AI-powered grant discovery and fit scoring."
  },
  crm: {
    key: "crm",
    name: "CRM",
    description: "Track funders, contacts, relationships, and deadlines."
  },
  scoringEngine: {
    key: "scoringEngine",
    name: "Scoring Engine",
    description: "AI scoring and rubric-based evaluation."
  },
  advancedReporting: {
    key: "advancedReporting",
    name: "Advanced Reporting",
    description: "Analytics dashboards and exportable reports."
  },
  complianceAutomation: {
    key: "complianceAutomation",
    name: "Compliance Automation",
    description: "Automated compliance checks and validations."
  },
  budgetAutomation: {
    key: "budgetAutomation",
    name: "Budget Automation",
    description: "AI-generated budgets and cost projections."
  },
  extraSeats: {
    key: "extraSeats",
    name: "Additional Team Seats",
    description: "Add more users beyond your plan limit."
  },
  vaultExpansion: {
    key: "vaultExpansion",
    name: "Document Vault Expansion",
    description: "Extra storage for documents and uploads."
  },
  packetExpansion: {
    key: "packetExpansion",
    name: "Packet Builder Expansion",
    description: "Unlock advanced packet builder features."
  }
};
