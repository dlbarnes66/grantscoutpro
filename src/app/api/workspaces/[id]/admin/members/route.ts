import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const ASSIGNABLE_ROLES = ["admin", "member"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

async function loadWorkspaceAndRole(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true },
  });

  if (!workspace) return { workspace: null, me: null };

  const me =
    workspace.ownerId === userId
      ? { role: "owner" as const }
      : workspace.members.find((m) => m.userId === userId);

  return { workspace, me };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        members: { include: { user: true } },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const me =
      workspace.ownerId === userId
        ? { role: "owner" }
        : workspace.members.find((m) => m.userId === userId);

    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = workspace.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      status: m.status,
      createdAt: m.createdAt,
      isOwner: m.userId === workspace.ownerId,
    }));

    return NextResponse.json({ success: true, members });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBERS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST supports two shapes:
//   { action: "add", email, role }               -> add an existing user as a member
//   { action: "activate" | "deactivate", userId } -> toggle an existing member's status
export async function POST(
  req: NextRequest,
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
    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.action !== "string") {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    if (body.action === "add") {
      // Only the owner can add new members / grant admin access.
      if (me.role !== "owner") {
        return NextResponse.json(
          { error: "Only the workspace owner can add members" },
          { status: 403 }
        );
      }

      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const role = body.role as AssignableRole;

      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
      if (!ASSIGNABLE_ROLES.includes(role)) {
        return NextResponse.json(
          { error: `Role must be one of: ${ASSIGNABLE_ROLES.join(", ")}` },
          { status: 400 }
        );
      }

      const invitedUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });

      if (!invitedUser) {
        return NextResponse.json(
          {
            error:
              "No account found for that email. They need to sign up for Grant Scout Pro first, then you can add them.",
          },
          { status: 404 }
        );
      }

      if (invitedUser.id === workspace.ownerId) {
        return NextResponse.json(
          { error: "That person already owns this workspace" },
          { status: 400 }
        );
      }

      const existing = workspace.members.find((m) => m.userId === invitedUser.id);
      if (existing) {
        return NextResponse.json(
          { error: "That person is already a member of this workspace" },
          { status: 409 }
        );
      }

      const created = await prisma.workspaceMember.create({
        data: {
          workspaceId: params.id,
          userId: invitedUser.id,
          role,
          status: "active",
        },
      });

      return NextResponse.json({
        success: true,
        member: {
          id: created.id,
          userId: created.userId,
          email: invitedUser.email,
          name: invitedUser.name,
          role: created.role,
          status: created.status,
          createdAt: created.createdAt,
          isOwner: false,
        },
      });
    }

    if (body.action === "activate" || body.action === "deactivate") {
      if (!body.userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }
      if (body.userId === workspace.ownerId) {
        return NextResponse.json(
          { error: "Cannot change the owner's status" },
          { status: 400 }
        );
      }

      const status = body.action === "deactivate" ? "inactive" : "active";

      const updated = await prisma.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId: params.id,
            userId: body.userId,
          },
        },
        data: { status },
      });

      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBERS POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH { userId, role } -> change an existing (non-owner) member's role.
export async function PATCH(
  req: NextRequest,
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
    if (!me || me.role !== "owner") {
      return NextResponse.json(
        { error: "Only the workspace owner can change member roles" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const targetUserId = body?.userId as string | undefined;
    const role = body?.role as AssignableRole | undefined;

    if (!targetUserId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
    }
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${ASSIGNABLE_ROLES.join(", ")}` },
        { status: 400 }
      );
    }
    if (targetUserId === workspace.ownerId) {
      return NextResponse.json(
        { error: "Cannot change the owner's role" },
        { status: 400 }
      );
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: params.id,
          userId: targetUserId,
        },
      },
      data: { role },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBERS PATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE { userId } -> remove a (non-owner) member from the workspace.
export async function DELETE(
  req: NextRequest,
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
    if (!me || me.role !== "owner") {
      return NextResponse.json(
        { error: "Only the workspace owner can remove members" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const targetUserId = body?.userId as string | undefined;

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    if (targetUserId === workspace.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove the workspace owner" },
        { status: 400 }
      );
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId: params.id,
          userId: targetUserId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBERS DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
