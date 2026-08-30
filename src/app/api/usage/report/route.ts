import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    const billing = await prisma.workspaceBilling.findUnique({
      where: { workspaceId },
    });

    if (!billing) {
      return NextResponse.json(
        { error: "Billing record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      workspaceId,
      usage: {
        searches: billing.usageSearches,
        uploads: billing.usageUploads,
        members: billing.usageMembers,
        ai: billing.usageAI,
      },
    });
  } catch (err: any) {
    console.error("usage report error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
