import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

// "Submit" inside Grant Scout Pro means marking the package done and
// ready here - this never submits anything to the funder's own website.
// The user still takes the finished package (or the PDF export) and
// submits it through the funder's actual application process themselves.
export async function POST(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!existing) {
    return NextResponse.json({ error: "No package to finalize yet - generate one first." }, { status: 404 });
  }

  const application = await prisma.application.update({
    where: { id: existing.id },
    data: { status: "ready" },
  });

  return NextResponse.json({ status: application.status });
}
