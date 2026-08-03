import { prisma } from "@/lib/prisma";

/**
 * Enforce workspace access rules based on billing status, trial/pilot locks,
 * and active add-ons. This does NOT block the request — it returns an access
 * object that other guards (requireWorkspaceAccess) can use.
 */
export async function enforceWorkspaceAccess(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      addons: true,
      billing: true,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const tier = workspace.subscriptionTier;
  const status = workspace.billingStatus;
  const addons = workspace.addons.map(a => a.addonType);

  const access = {
    tier,
    status,
    addons,
    readOnly: false,
    features: {
      crm: addons.includes("crm"),
      foundations: addons.includes("foundations"),
      state: addons.includes("state"),
      seats: addons.includes("seats"),
    },
    limits: {
      seats: workspace.maxSeats,
      ai: workspace.billing?.usageAI ?? 0,
      uploads: workspace.billing?.usageUploads ?? 0,
      searches: workspace.billing?.usageSearches ?? 0,
    },
  };

  // ---------------------------------------------------------
  // Billing status enforcement
  // ---------------------------------------------------------
  if (status === "past_due" || status === "unpaid") {
    access.readOnly = true;
  }

  if (status === "canceled") {
    access.readOnly = true;
  }

  // ---------------------------------------------------------
  // Trial enforcement
  // ---------------------------------------------------------
  if (workspace.trialLocked) {
    access.readOnly = true;
  }

  // ---------------------------------------------------------
  // Pilot enforcement
  // ---------------------------------------------------------
  if (workspace.pilotLocked) {
    access.readOnly = true;
  }

  return access;
}
