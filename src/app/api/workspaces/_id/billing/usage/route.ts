import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { billing: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isOwner = workspace.ownerId === userId;
    const isAdmin = await prisma.workspaceMember.findFirst({
      where: { workspaceId: params.id, userId, role: "admin" },
    });

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const b = workspace.billing;

    const usage = {
      searches: {
        used: b.usageSearches,
        limit: b.documentLimit,
        remaining: b.documentLimit - b.usageSearches,
      },
      uploads: {
        used: b.usageUploads,
        limit: b.storageLimitMb,
        remaining: b.storageLimitMb - b.usageUploads,
      },
      members: {
        used: b.usageMembers,
        limit: b.seats,
        remaining: b.seats - b.usageMembers,
      },
      ai: {
        used: b.usageAI,
        limit: b.aiTokensMonthly,
        remaining: b.aiTokensMonthly - b.usageAI,
      },
    };

    return NextResponse.json({ success: true, usage });
  } catch (err: any) {
    console.error("WORKSPACE BILLING USAGE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
