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

    // usageMembers on WorkspaceBilling is a stored counter that's only
    // ever initialized to 1 and never actually incremented when someone
    // joins - it's not a real source of truth. Members added/removed is
    // easy to just count live instead, so this stat can't ever drift
    // stale the way that stored field does.
    const activeMemberCount =
      workspace.members.filter((m) => m.status === "active").length + 1; // +1 for the owner

    return NextResponse.json({
      success: true,
      usage: {
        searches: billing?.usageSearches ?? 0,
        uploads: billing?.usageUploads ?? 0,
        members: activeMemberCount,
        ai: billing?.usageAI ?? 0,
      },
    });
  } catch (err: any) {
    console.error("USAGE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
