import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: { members: true, billing: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const billing = workspace.billing;

    return NextResponse.json({
      success: true,
      usage: {
        searches: billing?.usageSearches ?? 0,
        uploads: billing?.usageUploads ?? 0,
        members: billing?.usageMembers ?? workspace.members.length + 1,
        ai: billing?.usageAI ?? 0,
      },
    });
  } catch (err: any) {
    console.error("USAGE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
