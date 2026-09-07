import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/security/super-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId || !(await isSuperAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, activeWorkspaces, documents, aiUsageCount, writerCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.workspace.count({ where: { suspended: false } }),
      prisma.workspaceDocument.count(),
      prisma.aiUsage.count(),
      prisma.workspaceActivity.count({
        where: { action: { startsWith: "writer:" } },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    activeWorkspaces,
    documents,
    aiRequests: aiUsageCount + writerCount,
  });
}
