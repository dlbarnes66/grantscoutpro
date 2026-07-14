import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole, canViewAnalytics } from "@/lib/security/workspace-acl";

export async function GET(req, { params }) {
  const { workspaceId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getWorkspaceRole(userId, workspaceId);

  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!canViewAnalytics(role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Example analytics (replace with real metrics)
  const documentCount = await prisma.workspaceDocument.count({
    where: { workspaceId },
  });

  const grantCount = await prisma.grant.count({
    where: { workspaceId },
  });

  const aiUsage = await prisma.aiLog.count({
    where: { workspaceId },
  });

  return NextResponse.json({
    documentCount,
    grantCount,
    aiUsage,
    role,
  });
}
