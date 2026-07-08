// lib/userLimits.ts

import { PLAN_CAPABILITIES, PlanName } from "./planCapabilities";
import { AddonKey } from "./addonCapabilities";

export type WorkspaceLike = {
  subscriptionPlan: PlanName;
  addons: AddonKey[];
  users: number;
};

export function canAddMoreUsers(workspace: WorkspaceLike): boolean {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  const max = caps.maxUsers;

  if (workspace.addons.includes("extraSeats")) {
    return true;
  }

  return workspace.users < max;
}

export function canAddUser(workspace: WorkspaceLike): boolean {
  return canAddMoreUsers(workspace);
}

export function getWorkspaceLimit(workspace: WorkspaceLike): number {
  const caps = PLAN_CAPABILITIES[workspace.subscriptionPlan];
  return caps.workspaceLimit;
}
