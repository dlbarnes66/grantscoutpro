import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserOrg } from "@/lib/workspace/orgAccess";
import { PERMISSIONS, PERMISSION_KEYS, isValidPermissionKey } from "@/lib/workspace/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

async function loadWorkspaceRoleAndOrg(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true, org: true },
  });

  if (!workspace || workspace.deletedAt) return { workspace: null, me: null, org: null };

  const me =
    workspace.ownerId === userId
      ? { role: "owner" as const }
      : workspace.members.find((m) => m.userId === userId) ?? null;

  let org = workspace.org;
  if (!org) {
    org = await ensureUserOrg(workspace.ownerId);
    await prisma.workspace.update({ where: { id: workspace.id }, data: { orgId: org.id } });
  }

  return { workspace, me, org };
}

function isOwnerOrAdmin(role: string | undefined | null) {
  return role === "owner" || role === "admin";
}

// GET -> list this org's custom roles, plus the permission catalog so
// the UI can render checkboxes without hardcoding them twice.
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me, org } = await loadWorkspaceRoleAndOrg(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const roles = await prisma.orgRole.findMany({
      where: { orgId: org!.id },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { members: true } } },
    });

    return NextResponse.json({
      success: true,
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions,
        memberCount: r._count.members,
      })),
      permissionCatalog: PERMISSIONS,
      canManage: isOwnerOrAdmin(me.role),
    });
  } catch (err: any) {
    console.error("ORG ROLES GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST { name, permissions } -> create a new role for this org.
export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me, org } = await loadWorkspaceRoleAndOrg(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!me || !isOwnerOrAdmin(me.role)) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can create roles." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const permissions = Array.isArray(body?.permissions) ? body.permissions : [];

    if (!name) return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    if (name.length > 60) return NextResponse.json({ error: "Role name is too long" }, { status: 400 });

    const invalid = permissions.filter((p: unknown) => typeof p !== "string" || !isValidPermissionKey(p));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Unknown permission(s): ${invalid.join(", ")}. Valid: ${PERMISSION_KEYS.join(", ")}` },
        { status: 400 }
      );
    }

    const role = await prisma.orgRole.create({
      data: { orgId: org!.id, name, permissions },
    });

    return NextResponse.json({
      success: true,
      role: { id: role.id, name: role.name, permissions: role.permissions, memberCount: 0 },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A role with that name already exists." }, { status: 409 });
    }
    console.error("ORG ROLES POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
