import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

// Reverses .../package/finalize. Before this route existed, marking a
// package "ready" was a one-way trip - there was no way in the app to fix
// a typo or update a number afterward without generating a brand new
// package from scratch. This just moves it back to "draft" so the
// existing content/budget can be edited and saved again.
export async function POST(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.application.findFirst({ where: { workspaceId: params.id, grantId: params.grantId } });
  if (!existing) {
    return NextResponse.json({ error: "No package to reopen yet - generate one first." }, { status: 404 });
  }

  const application = await prisma.application.update({
    where: { id: existing.id },
    data: { status: "draft" },
  });

  return NextResponse.json({ status: application.status });
}
