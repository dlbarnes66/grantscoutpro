import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { isSuperAdmin } from "@/lib/security/super-admin";

export async function GET(req) {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Totals
  const totalUsers = await prisma.user.count();
  const totalWorkspaces = await prisma.workspace.count();
  const totalGrants = await prisma.grant.count();
  const totalDocuments = await prisma.document.count();

  // AI usage totals
  const aiTotals = await prisma.aiUsage.aggregate({
    _sum: { tokens: true, cost: true }
  });

  // Billing totals
  const billingTotals = await prisma.workspaceBilling.aggregate({
    _sum: { amount: true }
  });

  // Growth (last 30 days)
  const recentUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  const recentWorkspaces = await prisma.workspace.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  // Churn (workspaces marked inactive)
  const churnedWorkspaces = await prisma.workspace.count({
    where: { status: "inactive" }
  });

  // Enterprise adoption
  const enterpriseWorkspaces = await prisma.workspace.count({
    where: { orgId: { not: null } }
  });

  return NextResponse.json({
    totals: {
      users: totalUsers,
      workspaces: totalWorkspaces,
      grants: totalGrants,
      documents: totalDocuments,
    },
    ai: {
      tokens: aiTotals._sum.tokens ?? 0,
      cost: aiTotals._sum.cost ?? 0,
    },
    billing: {
      revenue: billingTotals._sum.amount ?? 0,
    },
    growth: {
      newUsers30d: recentUsers,
      newWorkspaces30d: recentWorkspaces,
    },
    churn: {
      churnedWorkspaces,
    },
    enterprise: {
      enterpriseWorkspaces,
    }
  });
}
