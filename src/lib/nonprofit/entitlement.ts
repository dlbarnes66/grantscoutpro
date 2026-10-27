import { prisma } from "@/lib/prisma";

// Nonprofit Management is a separate app (its own repo and domain) that signs
// in with the same Clerk users as Grant Scout Pro. A workspace unlocks it by
// buying the "nonprofit" addon; no plan tier includes it. The app checks this
// through /api/internal/nonprofit-os/entitlement, never by reading this
// database directly.
export async function hasNonprofitAccess(workspaceId: string): Promise<boolean> {
  if (!workspaceId) return false;
  const addon = await prisma.workspaceAddon.findFirst({
    where: { workspaceId, addonType: "nonprofit", active: true },
    select: { id: true },
  });
  return !!addon;
}

/** The Nonprofit Management app's address, or null when it isn't set up in this environment. */
export function nonprofitAppUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_NONPROFIT_OS_URL?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}
