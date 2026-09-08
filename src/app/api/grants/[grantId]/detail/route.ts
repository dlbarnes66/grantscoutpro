import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireWorkspaceMember } from "@/lib/auth";

type Params = { grantId: string };

// Same fix as related/route.ts: workspaceId comes from the query string,
// not `params` (which never had it - only grantId is a real segment
// here). Also now checks the found grant actually belongs to that
// workspace before returning it, instead of trusting grantId alone.
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

    return NextResponse.json(grant);
  } catch (err: any) {
    const message = err?.message || "Failed to load grant.";
    const status = message.startsWith("Unauthorized") ? 401 : message.includes("access") ? 403 : 500;
    if (status === 500) console.error("GRANT DETAIL ERROR:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
