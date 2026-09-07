import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess, loadNegotiationPrep } from "@/lib/ai/negotiation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/ai/negotiation?workspaceId=...&grantId=...
// Returns whatever negotiation prep has already been generated for this
// grant (per section), without calling the model again, so the page can
// load instantly and only regenerate a section on demand.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || "";
  const grantId = req.nextUrl.searchParams.get("grantId") || "";

  if (!workspaceId || !grantId) {
    return NextResponse.json({ error: "workspaceId and grantId are required" }, { status: 400 });
  }

  const allowed = await assertGrantWorkspaceAccess(workspaceId, grantId, userId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: { id: true, title: true, agency: true, deadline: true },
    });
    const sections = await loadNegotiationPrep(grantId);

    return NextResponse.json({ success: true, grant, sections });
  } catch (err: any) {
    console.error("NEGOTIATION GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
