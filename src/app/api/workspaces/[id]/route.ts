import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

async function loadWorkspaceAndRole(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: { include: { user: true } },
      invites: true,
    },
  });

  if (!workspace || workspace.deletedAt) return { workspace: null, me: null };

  const me =
    workspace.ownerId === userId
      ? { role: "owner" as const }
      : workspace.members.find((m) => m.userId === userId) ?? null;

  return { workspace, me };
}

function isOwnerOrAdmin(role: string | undefined | null) {
  return role === "owner" || role === "admin";
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me } = await loadWorkspaceAndRole(params.id, userId);

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!me) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error("WORKSPACE DETAIL ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Owners/admins can rename a workspace. Only `name` is editable here -
// `slug` is left alone since it's already baked into any bookmarked
// links, integration webhooks, etc., and changing it out from under
// those isn't something to do as a side effect of an unrelated rename.
export async function PATCH(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me } = await loadWorkspaceAndRole(params.id, userId);

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!me || !isOwnerOrAdmin(me.role)) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can edit this workspace." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }
    if (name.length > 120) {
      return NextResponse.json({ error: "Workspace name is too long" }, { status: 400 });
    }

    const updated = await prisma.workspace.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json({ success: true, workspace: updated });
  } catch (err: any) {
    console.error("WORKSPACE PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Soft delete only. Workspace has ~80 relations (grants, documents,
// CRM data, billing, activity logs, ...) with no cascade rules defined
// in the schema, so an actual `prisma.workspace.delete()` would throw
// on the first foreign key it hits rather than cleanly removing
// everything. Setting deletedAt hides the workspace immediately
// (filtered out of the workspace list, and src/proxy.ts 404s every
// /api/workspaces/<id>/* route for it) without risking a half-deleted
// workspace or a cascade blowing away more than intended. A real
// permanent-delete/export flow can be built later if actually needed.
export async function DELETE(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, me } = await loadWorkspaceAndRole(params.id, userId);

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!me || !isOwnerOrAdmin(me.role)) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can delete this workspace." },
        { status: 403 }
      );
    }

    await prisma.workspace.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
