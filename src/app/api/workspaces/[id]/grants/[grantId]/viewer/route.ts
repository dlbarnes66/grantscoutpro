import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

export async function GET(
  _req: Request,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const grant = await prisma.grant.findUnique({
      where: { id: params.grantId },
      include: {
        viewerState: true,
        workspace: { include: { members: true } },
      },
    });

    if (!grant || grant.workspaceId !== params.id) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    const workspace = grant.workspace;

    const isMember =
      workspace.ownerId === userId ||
      workspace.members.some((m) => m.userId === userId);

    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ success: true, viewer: grant.viewerState });
  } catch (err: any) {
    console.error("WORKSPACE GRANT VIEWER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
