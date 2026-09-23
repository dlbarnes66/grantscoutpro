// A workspace's owner has exactly one UserProfile (unique per user), so
// two workspaces owned by the same person otherwise share one
// organizationType - which breaks the moment someone runs, say, a
// nonprofit and a for-profit venture as two separate workspaces (see
// Workspace.organizationTypeOverride in prisma/schema.prisma).
//
// Every place that decides grant eligibility or feeds organization type
// into an AI prompt should resolve it through here instead of reading
// UserProfile.organizationType directly, so a per-workspace override
// (set from that workspace's own grant-profile settings) is always
// honored.
// The single source of truth for the type picker - reused by
// workspace creation, workspace grant-profile settings, and (via its
// own separate copy today) onboarding. Free strings, not a Prisma
// enum, so this list can grow without a migration.
export const ORG_TYPES = [
  "Nonprofit",
  "School District",
  "College / University",
  "Municipality",
  "Tribal Government",
  "For-Profit",
] as const;

export function resolveOrganizationType(
  workspace: { organizationTypeOverride?: string | null },
  ownerProfile: { organizationType?: string | null } | null | undefined
): string | null {
  return workspace.organizationTypeOverride || ownerProfile?.organizationType || null;
}
