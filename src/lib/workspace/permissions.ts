import { prisma } from "@/lib/prisma";

// Fixed catalog of permission flags a custom OrgRole can grant. This is
// additive on top of the existing owner/admin/member system - owners
// and admins keep full access to everything regardless of custom
// roles, which exist purely to let an org hand out narrower access
// (e.g. "Grant Writer" gets manage_grants + manage_applications but
// not manage_crm) to plain "member" accounts.
//
// v1 wires enforcement into two representative places (CRM contacts,
// task creation - see hasPermission's call sites) as a working
// example of the system end to end; extending it to more routes is a
// small, mechanical addition (call hasPermission before the write).
export const PERMISSIONS = [
  {
    key: "manage_grants",
    label: "Manage grants",
    description: "Save, track, and update the status of grants in this workspace",
  },
  {
    key: "manage_applications",
    label: "Manage applications",
    description: "Edit, package, and submit grant applications",
  },
  {
    key: "manage_budgets",
    label: "Manage budgets",
    description: "Create and edit grant budgets",
  },
  {
    key: "manage_documents",
    label: "Manage documents",
    description: "Upload, edit, and delete workspace documents and files",
  },
  {
    key: "manage_crm",
    label: "Manage CRM",
    description: "Add and edit donor/funder contacts and deals",
  },
  {
    key: "manage_tasks",
    label: "Manage tasks",
    description: "Create, assign, and complete tasks",
  },
  {
    key: "view_reports",
    label: "View reports",
    description: "View workspace analytics and reporting",
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];
export const PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

export function isValidPermissionKey(key: string): key is PermissionKey {
  return (PERMISSION_KEYS as string[]).includes(key);
}

// True if this user can perform `permission` in this workspace: owners
// and admins always can (custom roles never restrict them); everyone
// else needs a custom role assigned that includes this permission.
export async function hasPermission(
  workspaceId: string,
  userId: string,
  permission: PermissionKey
): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      ownerId: true,
      members: {
        where: { userId },
        select: { role: true, customRole: { select: { permissions: true } } },
      },
    },
  });

  if (!workspace) return false;
  if (workspace.ownerId === userId) return true;

  const member = workspace.members[0];
  if (!member) return false;
  if (member.role === "owner" || member.role === "admin") return true;

  return member.customRole?.permissions.includes(permission) ?? false;
}
