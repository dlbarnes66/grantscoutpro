import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserOrg } from "@/lib/workspace/orgAccess";

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

  // Workspaces created before org-level billing existed (or ones that
  // otherwise never got backfilled) have orgId: null. Rather than
  // surfacing "no organization" as a dead end, lazily create one for
  // the workspace's owner - same thing ensureUserOrg already does the
  // first time an owner hits any org-aware code path - and attach it.
  if (!org) {
    org = await ensureUserOrg(workspace.ownerId);
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { orgId: org.id },
    });
  }

  return { workspace, me, org };
}

function isOwnerOrAdmin(role: string | undefined | null) {
  return role === "owner" || role === "admin";
}

export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me, org } = await loadWorkspaceRoleAndOrg(params.id, userId);

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!me) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      organization: { id: org!.id, name: org!.name, tier: org!.tier },
      canEdit: isOwnerOrAdmin(me.role),
    });
  } catch (err: any) {
    console.error("WORKSPACE ORGANIZATION GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Owners/admins of this workspace can rename the organization it
// belongs to. Note this affects every other workspace under the same
// Org too (in practice, almost always just this one account's other
// workspaces) - there's no separate per-org member/role list in this
// schema, so workspace-level owner/admin is the permission this app
// already uses for every other account-level action.
export async function PATCH(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me, org } = await loadWorkspaceRoleAndOrg(params.id, userId);

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!me || !isOwnerOrAdmin(me.role)) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can edit the organization profile." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }
    if (name.length > 120) {
      return NextResponse.json({ error: "Organization name is too long" }, { status: 400 });
    }

    const updated = await prisma.org.update({
      where: { id: org!.id },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      organization: { id: updated.id, name: updated.name, tier: updated.tier },
    });
  } catch (err: any) {
    console.error("WORKSPACE ORGANIZATION PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
