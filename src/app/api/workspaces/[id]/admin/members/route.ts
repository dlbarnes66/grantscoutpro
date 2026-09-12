import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/ai/activity-log";
import { sendEmailSafe } from "@/lib/email/sendgrid";
import { workspaceInviteEmail, workspaceInvitePendingEmail } from "@/lib/email/templates";
import { getEffectivePlan, isAtSeatLimit, getSeatLimitLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const ASSIGNABLE_ROLES = ["admin", "member"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

// Activity logging should never fail the actual member-management
// action it's attached to, so failures are swallowed and logged.
function logActivitySafe(workspaceId: string, action: string, metadata: any, userId?: string) {
  return logActivity(workspaceId, action, metadata, userId).catch((err) => {
    console.error(`Failed to log workspace activity "${action}":`, err);
  });
}

async function loadWorkspaceAndRole(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      billing: true,
      org: true,
      invites: { where: { status: "pending" } },
    },
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
        invites: { where: { status: "pending" }, orderBy: { createdAt: "desc" } },
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

    const invites = workspace.invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      createdAt: i.createdAt,
    }));

    return NextResponse.json({ success: true, members, invites, viewerRole: me.role });
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
        // No account yet - send a real invite instead of just failing.
        // Whoever signs up with this email address gets added
        // automatically by the Clerk webhook (see
        // src/app/api/webhooks/clerk/route.ts, user.created).
        const plan = getEffectivePlan(workspace);
        const seatsInUse = workspace.members.length + workspace.invites.length;

        const existingInvite = workspace.invites.find(
          (i) => i.email.toLowerCase() === email
        );

        if (!existingInvite && isAtSeatLimit(plan, seatsInUse)) {
          return NextResponse.json(
            {
              error: `Your ${plan.name} plan is limited to ${getSeatLimitLabel(
                plan
              ).toLowerCase()}. Upgrade your plan to invite more teammates.`,
            },
            { status: 403 }
          );
        }

        const invite = existingInvite
          ? await prisma.workspaceInvite.update({
              where: { id: existingInvite.id },
              data: { role },
            })
          : await prisma.workspaceInvite.create({
              data: { workspaceId: params.id, email, role, invitedById: userId },
            });

        await logActivitySafe(
          params.id,
          existingInvite ? "invite_resent" : "invite_sent",
          { targetEmail: email, role },
          userId
        );

        const inviter = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        const { subject, html, text } = workspaceInvitePendingEmail({
          workspaceName: workspace.name,
          inviterName: inviter?.name ?? null,
          role,
          email,
        });

        void sendEmailSafe({ to: email, subject, html, text });

        return NextResponse.json({
          success: true,
          invited: true,
          invite: { id: invite.id, email: invite.email, role: invite.role, createdAt: invite.createdAt },
        });
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

      const planForExisting = getEffectivePlan(workspace);
      const seatsInUseForExisting = workspace.members.length + workspace.invites.length;
      if (isAtSeatLimit(planForExisting, seatsInUseForExisting)) {
        return NextResponse.json(
          {
            error: `Your ${planForExisting.name} plan is limited to ${getSeatLimitLabel(
              planForExisting
            ).toLowerCase()}. Upgrade your plan to add more teammates.`,
          },
          { status: 403 }
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

      await logActivitySafe(
        params.id,
        "member_added",
        { targetUserId: invitedUser.id, targetEmail: invitedUser.email, role },
        userId
      );

      if (invitedUser.email) {
        const inviter = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        const { subject, html, text } = workspaceInviteEmail({
          workspaceName: workspace.name,
          inviterName: inviter?.name ?? null,
          role,
          workspaceId: params.id,
        });

        // Don't let a slow/failed email block the response - the member is
        // already added either way.
        void sendEmailSafe({ to: invitedUser.email, subject, html, text });
      }

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

    if (body.action === "revokeInvite") {
      // Only the owner can add new members, so only the owner revokes
      // pending invites too.
      if (me.role !== "owner") {
        return NextResponse.json(
          { error: "Only the workspace owner can revoke invites" },
          { status: 403 }
        );
      }

      const inviteId = typeof body.inviteId === "string" ? body.inviteId : "";
      if (!inviteId) {
        return NextResponse.json({ error: "Missing inviteId" }, { status: 400 });
      }

      const invite = workspace.invites.find((i) => i.id === inviteId);
      if (!invite) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 });
      }

      await prisma.workspaceInvite.update({
        where: { id: inviteId },
        data: { status: "revoked" },
      });

      await logActivitySafe(params.id, "invite_revoked", { targetEmail: invite.email }, userId);

      return NextResponse.json({ success: true });
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

      await logActivitySafe(
        params.id,
        body.action === "deactivate" ? "member_deactivated" : "member_activated",
        { targetUserId: body.userId },
        userId
      );

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

    await logActivitySafe(params.id, "member_role_changed", { targetUserId, role }, userId);

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

    await logActivitySafe(params.id, "member_removed", { targetUserId }, userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE ADMIN MEMBERS DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
