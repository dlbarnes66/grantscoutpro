import { prisma } from "@/lib/prisma";
import { resolveOrganizationType } from "@/lib/grants/orgType";
import { checkRateLimit } from "@/lib/rateLimit";

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
    ["organization name", profile?.organizationName],
    ["EIN", profile?.ein],
    ["UEI", profile?.uei],
    ["street address", profile?.streetAddress],
    ["city", profile?.city],
    ["state", profile?.state],
    ["ZIP code", profile?.zipCode],
    ["authorized representative name", profile?.authorizedRepName],
    ["authorized representative email", profile?.authorizedRepEmail],
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
