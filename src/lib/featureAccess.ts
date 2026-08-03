import { PLAN_CAPABILITIES, PlanName } from "./planCapabilities";
import { AddonKey } from "./addonCapabilities";

export type WorkspaceLike = {
  subscriptionPlan: PlanName;
  addons: AddonKey[];
};

export function hasAIWriter(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.aiWriter || workspace.addons.includes("aiWriter");
}

export function hasGrantMatching(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.grantMatching || workspace.addons.includes("grantMatching");
}

export function hasCRM(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.crm || workspace.addons.includes("crm");
}

export function hasScoringEngine(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.scoringEngine || workspace.addons.includes("scoringEngine");
}

export function hasAdvancedReporting(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.advancedReporting || workspace.addons.includes("advancedReporting");
}

export function hasComplianceAutomation(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.complianceAutomation || workspace.addons.includes("complianceAutomation");
}

export function hasBudgetAutomation(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.budgetAutomation || workspace.addons.includes("budgetAutomation");
}
