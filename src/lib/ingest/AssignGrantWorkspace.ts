import { prisma } from "@/lib/prisma";

export async function assignGrantWorkspace(grant: any) {
  let workspaceId: string | null = null;

  // Correct enum type from Prisma schema
  let tierAccess: "FEDERAL_ONLY" | "FEDERAL_STATE" | "PRO" | "ENTERPRISE";

  const source = grant.source ?? "unknown";

  if (source === "federal") {
    tierAccess = "FEDERAL_ONLY";
  } else if (source === "state") {
    tierAccess = "FEDERAL_STATE";
  } else if (source === "foundation" || source === "philanthropic") {
    tierAccess = "PRO";
  } else {
    tierAccess = "ENTERPRISE";
  }

  // No workspace assignment yet — placeholder for future logic
  workspaceId = null;

  await prisma.grant.update({
    where: { id: grant.id },
    data: { tierAccess },
  });

  return { workspaceId, tierAccess };
}
