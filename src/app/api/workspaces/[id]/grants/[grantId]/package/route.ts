import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const grant = await prisma.grant.findUnique({
    where: { id: params.grantId },
    select: { title: true, aiEligibilityScore: true, aiSummary: true },
  });
  if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  // Shared per grant+workspace, not per-user - any workspace member can
  // pick up and continue building the same package.
  const application = await prisma.application.findFirst({
    where: { workspaceId: params.id, grantId: params.grantId },
  });

  let sections: { title: string; content: string }[] = [];
  if (application?.content) {
    try {
      sections = JSON.parse(application.content)?.sections || [];
    } catch {
      sections = [];
    }
  }

  return NextResponse.json({
    grant,
    status: application?.status || null,
    sections,
    budget: application?.budget || null,
    updatedAt: application?.updatedAt || null,
  });
}
