import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/security/super-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId || !(await isSuperAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { action, payload } = body as {
    action?: string;
    payload?: { workspaceId?: string };
  };

  const workspaceId = payload?.workspaceId?.trim();

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Missing workspaceId" },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 404 }
    );
  }

  try {
    switch (action) {
      case "repairWorkspace": {
        const billing = await prisma.workspaceBilling.upsert({
          where: { workspaceId },
          update: {},
          create: { workspaceId, plan: "free" },
        });

        const ownerMember = await prisma.workspaceMember.upsert({
          where: {
            workspaceId_userId: { workspaceId, userId: workspace.ownerId },
          },
          update: { status: "active" },
          create: {
            workspaceId,
            userId: workspace.ownerId,
            role: "owner",
            status: "active",
          },
        });

        return NextResponse.json({
          success: true,
          action,
          workspaceId,
          billing,
          ownerMember,
        });
      }

      case "fixMembers": {
        const ownerMember = await prisma.workspaceMember.upsert({
          where: {
            workspaceId_userId: { workspaceId, userId: workspace.ownerId },
          },
          update: { status: "active", role: "owner" },
          create: {
            workspaceId,
            userId: workspace.ownerId,
            role: "owner",
            status: "active",
          },
        });

        const activeMemberCount = await prisma.workspaceMember.count({
          where: { workspaceId, status: "active" },
        });

        return NextResponse.json({
          success: true,
          action,
          workspaceId,
          ownerMember,
          activeMemberCount,
        });
      }

      case "syncBilling": {
        const activeMemberCount = await prisma.workspaceMember.count({
          where: { workspaceId, status: "active" },
        });

        const seats = Math.max(activeMemberCount, 1);

        const billing = await prisma.workspaceBilling.upsert({
          where: { workspaceId },
          update: { seats },
          create: { workspaceId, plan: "free", seats },
        });

        return NextResponse.json({
          success: true,
          action,
          workspaceId,
          billing,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error("WORKSPACE REPAIR ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Repair failed" },
      { status: 500 }
    );
  }
}
