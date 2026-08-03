import { PLAN_CAPABILITIES, PlanName } from "./planCapabilities";
import { AddonKey } from "./addonCapabilities";

export type WorkspaceLike = {
  subscriptionPlan: PlanName;
  addons: AddonKey[];
  users?: any[];
};

export function canUseAIWriter(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.aiWriter || workspace.addons.includes("aiWriter");
}

export function canUseGrantMatching(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.grantMatching || workspace.addons.includes("grantMatching");
}

export function canUseCRM(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.crm || workspace.addons.includes("crm");
}

export function canUseScoringEngine(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.scoringEngine || workspace.addons.includes("scoringEngine");
}

export function canUseAdvancedReporting(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.advancedReporting || workspace.addons.includes("advancedReporting");
}

export function canUseComplianceAutomation(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.complianceAutomation || workspace.addons.includes("complianceAutomation");
}

export function canUseBudgetAutomation(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.budgetAutomation || workspace.addons.includes("budgetAutomation");
}

export function canAddMoreUsers(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  const max = caps.maxUsers;

  if (workspace.addons.includes("extraSeats")) {
    return true;
  }

  return (workspace.users?.length || 0) < max;
}

export function canUseVaultExpansion(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.vaultExpansionIncluded || workspace.addons.includes("vaultExpansion");
}

export function canUsePacketExpansion(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.packetExpansionIncluded || workspace.addons.includes("packetExpansion");
}
