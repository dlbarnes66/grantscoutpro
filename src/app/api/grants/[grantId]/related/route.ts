import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

type Params = { grantId: string };

// grantId is real (it's the dynamic segment in this file's path), but
// there's no [workspaceId] segment, so workspaceId has to come from the
// query string - it used to be destructured from `params` alongside
// grantId, where it was always undefined, silently disabling the
// workspace scope on the query below.
export async function GET(req: Request, context: { params: Promise<Params> }) {
  try {
    await requireUser();
    const { grantId } = await context.params;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    await requireWorkspaceMember(workspaceId);

    const grant = await prisma.grant.findUnique({ where: { id: grantId } });

    if (!grant || grant.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Grant not found." }, { status: 404 });
    }

    const related = await prisma.grant.findMany({
      where: {
        workspaceId,
        category: grant.category,
        id: { not: grantId },
      },
      take: 10,
    });

    return NextResponse.json(related);
  } catch (err: any) {
    const message = err?.message || "Failed to load related grants.";
    const status = message.startsWith("Unauthorized") ? 401 : message.includes("access") ? 403 : 500;
    if (status === 500) console.error("GRANT RELATED ERROR:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
