import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PERMISSION_KEYS, isValidPermissionKey } from "@/lib/workspace/permissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; roleId: string };

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

  return { workspace, me, org: workspace.org };
}

function isOwnerOrAdmin(role: string | undefined | null) {
  return role === "owner" || role === "admin";
}

// PATCH { name?, permissions? } -> edit a role belonging to this workspace's org.
export async function PATCH(
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
      return NextResponse.json({ error: "Only workspace owners or admins can edit roles." }, { status: 403 });
    }

    const existing = await prisma.orgRole.findUnique({ where: { id: params.roleId } });
    if (!existing || existing.orgId !== org?.id) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const data: { name?: string; permissions?: string[] } = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: "Role name cannot be empty" }, { status: 400 });
      if (name.length > 60) return NextResponse.json({ error: "Role name is too long" }, { status: 400 });
      data.name = name;
    }

    if (body?.permissions !== undefined) {
      const permissions = Array.isArray(body.permissions) ? body.permissions : [];
      const invalid = permissions.filter((p: unknown) => typeof p !== "string" || !isValidPermissionKey(p));
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Unknown permission(s): ${invalid.join(", ")}. Valid: ${PERMISSION_KEYS.join(", ")}` },
          { status: 400 }
        );
      }
      data.permissions = permissions;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }

    const updated = await prisma.orgRole.update({ where: { id: params.roleId }, data });

    return NextResponse.json({
      success: true,
      role: { id: updated.id, name: updated.name, permissions: updated.permissions },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A role with that name already exists." }, { status: 409 });
    }
    console.error("ORG ROLE PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE -> remove a role. Members holding it fall back to their base
// role (member/admin) automatically since customRoleId just goes null
// via the FK - nothing else to clean up.
export async function DELETE(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me, org } = await loadWorkspaceRoleAndOrg(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!me || !isOwnerOrAdmin(me.role)) {
      return NextResponse.json({ error: "Only workspace owners or admins can delete roles." }, { status: 403 });
    }

    const existing = await prisma.orgRole.findUnique({ where: { id: params.roleId } });
    if (!existing || existing.orgId !== org?.id) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    await prisma.workspaceMember.updateMany({
      where: { customRoleId: params.roleId },
      data: { customRoleId: null },
    });
    await prisma.orgRole.delete({ where: { id: params.roleId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("ORG ROLE DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
