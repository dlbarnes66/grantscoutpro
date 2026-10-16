import { prisma } from "@/lib/prisma";
import { resolveOrganizationType } from "@/lib/grants/orgType";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeWorkPlan, type WorkPlan } from "@/lib/ai/workPlan";

export type PackageSectionRow = { title: string; content: string };

export function parseSections(content: string | null | undefined): PackageSectionRow[] {
  if (!content) return [];
  try {
    const s = JSON.parse(content)?.sections;
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}

export function parseWorkPlan(content: string | null | undefined): WorkPlan | null {
  if (!content) return null;
  try {
    return sanitizeWorkPlan(JSON.parse(content)?.workPlan);
  } catch {
    return null;
  }
}

/** Grant Profile fields the auto-filled SF-424 forms need and the owner has not filled in. */
export async function getProfileContext(workspaceId: string): Promise<{
  gaps: string[];
  organizationType: string | null;
}> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true, organizationTypeOverride: true },
  });
  if (!workspace) return { gaps: [], organizationType: null };
  const profile = await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } });
  const checks: [string, unknown][] = [
    ["organization name", profile?.legalName || profile?.organizationName],
    ["EIN", profile?.ein],
    ["UEI", profile?.uei],
    ["street address", profile?.streetAddress],
    ["city", profile?.city],
    ["state", profile?.state],
    ["ZIP code", profile?.zipCode],
    ["organization phone", profile?.orgPhone],
    ["congressional district", profile?.congressionalDistrictApplicant],
    ["authorized representative name", profile?.authorizedRepName],
    ["authorized representative title", profile?.authorizedRepTitle],
    ["authorized representative email", profile?.authorizedRepEmail],
    ["Executive Order 12372 answer (SF-424 item 19)", profile?.eo12372Status],
    ["federal debt answer (SF-424 item 20)", typeof profile?.federalDebtDelinquent === "boolean" ? "set" : null],
  ];
  return {
    gaps: checks.filter(([, v]) => !(typeof v === "string" && v.trim())).map(([k]) => k),
    organizationType:
      resolveOrganizationType({ organizationTypeOverride: workspace.organizationTypeOverride ?? null }, profile) ?? null,
  };
}

/** Per-user hourly cap for the heavier package actions (AI calls, bundling files). */
export async function packageActionAllowed(action: string, userId: string, perHour = 10): Promise<boolean> {
  const rl = await checkRateLimit(`pkg-${action}:${userId}`, perHour, 60 * 60);
  return rl.allowed;
}
