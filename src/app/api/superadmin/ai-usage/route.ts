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

  const [usageAgg, writerCount, usageUsers, writerUsers] = await Promise.all([
    prisma.aiUsage.aggregate({
      _count: { _all: true },
      _sum: { tokens: true },
    }),
    prisma.workspaceActivity.count({
      where: { action: { startsWith: "writer:" } },
    }),
    prisma.aiUsage.findMany({
      distinct: ["userId"],
      select: { userId: true },
      where: { userId: { not: null } },
    }),
    prisma.workspaceActivity.findMany({
      distinct: ["userId"],
      select: { userId: true },
      where: { action: { startsWith: "writer:" }, userId: { not: null } },
    }),
  ]);

  const activeUserIds = new Set<string>();
  usageUsers.forEach((u) => u.userId && activeUserIds.add(u.userId));
  writerUsers.forEach((u) => u.userId && activeUserIds.add(u.userId));

  return NextResponse.json({
    totalRequests: (usageAgg._count._all ?? 0) + writerCount,
    totalTokens: usageAgg._sum.tokens ?? 0,
    activeUsers: activeUserIds.size,
  });
}
