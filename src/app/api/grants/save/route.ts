import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

// Same fix as recommendations/route.ts: no [workspaceId] segment in this
// file's path, so workspaceId has to come from the request body, not
// `params` (which was always empty, silently disabling the workspace scope
// on the queries below).
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }
    if (!body.grantId) {
      return NextResponse.json({ error: "grantId is required." }, { status: 400 });
    }

    await requireWorkspaceMember(workspaceId);

    // Ensure grant belongs to workspace
    const grant = await prisma.grant.findUnique({
      where: { id: body.grantId },
      select: { workspaceId: true },
    });

    if (!grant || grant.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Grant does not belong to this workspace." }, { status: 403 });
    }

    const saved = await prisma.savedGrant.create({
      data: {
        userId: user.id,
        grantId: body.grantId,
      },
    });

    return NextResponse.json(saved);
  } catch (err: any) {
    const message = err?.message || "Failed to save grant.";
    const status = message.startsWith("Unauthorized") ? 401 : message.includes("access") ? 403 : 500;
    if (status === 500) console.error("GRANT SAVE ERROR:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
