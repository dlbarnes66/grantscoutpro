import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

// Note: this route has no [workspaceId] segment in its path, so
// workspaceId has to come from the request itself (the body, since the
// page below POSTs) - it used to be destructured from `params`, which is
// always empty here, so requireWorkspaceMember(undefined) ran and Prisma
// silently drops an `undefined` filter, meaning the workspace-scoping on
// every query below was never actually applied.
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    await requireWorkspaceMember(workspaceId);

    // Get saved grants for this workspace
    const saved = await prisma.savedGrant.findMany({
      where: { userId: user.id },
      select: { grantId: true },
    });

    const savedIds = saved.map((s) => s.grantId);

    // Recommend grants not yet saved
    const recommendations = await prisma.grant.findMany({
      where: {
        workspaceId,
        id: { notIn: savedIds },
      },
      take: 20,
    });

    return NextResponse.json(recommendations);
  } catch (err: any) {
    const message = err?.message || "Failed to load recommendations.";
    const status = message.startsWith("Unauthorized") ? 401 : message.includes("access") ? 403 : 500;
    if (status === 500) console.error("GRANT RECOMMENDATIONS ERROR:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
